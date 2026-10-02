// Ghidra script: set up a classic 68k Mac program made by mac68k.py, analyse it and
// decompile every function to one C file.
// Usage (headless):
//   analyzeHeadless <projdir> <name> -import out.bin -loader BinaryLoader
//     -processor 68000:BE:32:default -noanalysis -scriptPath tools/decompile
//     -postScript Mac68k.java out.bin.syms out.c
// Also used for Palm OS programs made by palm68k.py: their .syms has no "a5" line (the
// globals are in the image) and "const <reg> <value>" lines for A5 and A4 instead.
// See docs/decompiling.md.
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.program.model.address.*;
import ghidra.program.model.lang.Register;
import ghidra.program.model.data.*;
import ghidra.program.model.listing.*;
import ghidra.program.model.mem.*;
import ghidra.program.model.symbol.*;
import java.io.*;
import java.math.BigInteger;
import java.nio.file.*;
import java.util.*;

public class Mac68k extends GhidraScript {
  Address a(long x) { return toAddr(x); }

  public void run() throws Exception {
    String[] args = getScriptArgs();
    List<String> lines = Files.readAllLines(Paths.get(args[0]));
    Memory mem = currentProgram.getMemory();
    long a5 = 0, below = 0;
    List<Object[]> traps = new ArrayList<>();
    Map<String, Integer> trapArgs = new TreeMap<>();
    List<String[]> rts = new ArrayList<>();
    List<String[]> sigs = new ArrayList<>();
    List<String[]> fns = new ArrayList<>();
    List<Long> stubs = new ArrayList<>();
    Map<String, Long> consts = new LinkedHashMap<>();
    for (String l : lines) {
      String[] t = l.trim().split(" ");
      if (t[0].equals("a5")) { a5 = Long.parseLong(t[1], 16); below = Long.parseLong(t[2], 16); }
      else if (t[0].equals("const")) consts.put(t[1], Long.parseLong(t[2], 16));
      else if (t[0].equals("jt")) stubs.add(Long.parseLong(t[1], 16));
      else if (t[0].equals("fn")) fns.add(t);
      else if (t[0].equals("rt")) rts.add(t);
      else if (t[0].equals("sig")) sigs.add(t);
      else if (t[0].equals("trap")) {
        String nm = t[3];
        traps.add(new Object[] { Long.parseLong(t[1], 16), nm });
        trapArgs.put(nm, Integer.parseInt(t[4]));
      }
    }
    // A5 globals and trap stubs
    if (a5 != 0) { mem.createUninitializedBlock("A5globals", a(a5 - below), below + 0x1000, false); consts.put("A5", a5); }
    if (!trapArgs.isEmpty()) mem.createInitializedBlock("traps", a(0x00E00000L), 0x2000, (byte) 0, monitor, false);
    Map<String, Address> trapAddr = new HashMap<>();
    long next = 0x00E00000L;
    for (Map.Entry<String, Integer> e : trapArgs.entrySet()) {
      Address s = a(next); next += 2;
      trapAddr.put(e.getKey(), s);
      mem.setShort(s, (short) 0x4E75);
      disassemble(s);
      Function f = createFunction(s, e.getKey());
      int n = e.getValue();
      if (f == null || n == 0) continue;
      // SANE: (short op, ptr, ptr, ...) on the stack, popped by the trap
      List<Variable> ps = new ArrayList<>();
      ps.add(new ParameterImpl("op", ShortDataType.dataType, 4, currentProgram));
      for (int i = 0; i < n; i++)
        ps.add(new ParameterImpl("p" + i, PointerDataType.dataType, 6 + 4 * i, currentProgram));
      f.updateFunction(null, null, (List) ps, Function.FunctionUpdateType.CUSTOM_STORAGE, true, SourceType.USER_DEFINED);
      f.setStackPurgeSize(2 + 4 * n);
    }
    // A5 (and on Palm A4) is constant in every segment
    for (Map.Entry<String, Long> e : consts.entrySet())
      currentProgram.getProgramContext().setValue(currentProgram.getRegister(e.getKey()), a(0), a(0x00DFFFFFL),
          BigInteger.valueOf(e.getValue()));
    for (Long s : stubs) { disassemble(a(s)); createFunction(a(s), null); }
    for (String[] t : fns) {
      Address s = a(Long.parseLong(t[1], 16));
      disassemble(s);
      Function f = getFunctionAt(s);
      if (f == null) f = createFunction(s, t[2]);
      else f.setName(t[2], SourceType.USER_DEFINED);
    }
    // "sig <addr> <ret> <args>": a stack-argument prototype (Palm OS traps). Letters: p pointer,
    // l long, s short, b byte (in a 2-byte slot), d double, f float, v void; pointers return in A0
    for (String[] t : sigs) {
      Function f = getFunctionAt(a(Long.parseLong(t[1], 16)));
      if (f == null) continue;
      List<Variable> ps = new ArrayList<>();
      int off = 4;
      String sa = t.length > 3 ? t[3] : "";
      for (int i = 0; i < sa.length(); i++) {
        char c = sa.charAt(i);
        DataType dt = c == 'p' ? PointerDataType.dataType : c == 's' ? ShortDataType.dataType
            : c == 'b' ? ByteDataType.dataType : c == 'd' ? DoubleDataType.dataType
            : c == 'f' ? FloatDataType.dataType : IntegerDataType.dataType;
        ps.add(new ParameterImpl("a" + i, dt, off + (c == 'b' ? 1 : 0), currentProgram));
        off += c == 'd' ? 8 : (c == 's' || c == 'b') ? 2 : 4;
      }
      char r0 = t[2].charAt(0);
      ReturnParameterImpl ret = r0 == 'v' ? new ReturnParameterImpl(VoidDataType.dataType, currentProgram)
          : r0 == 'p' ? new ReturnParameterImpl(PointerDataType.dataType, currentProgram.getRegister("A0"), currentProgram)
          : new ReturnParameterImpl(r0 == 's' ? ShortDataType.dataType : r0 == 'b' ? ByteDataType.dataType
              : r0 == 'f' ? FloatDataType.dataType : IntegerDataType.dataType,
              currentProgram.getRegister(r0 == 's' ? "D0w" : r0 == 'b' ? "D0b" : "D0"), currentProgram);
      f.updateFunction(null, ret, (List) ps, Function.FunctionUpdateType.CUSTOM_STORAGE, true, SourceType.USER_DEFINED);
    }
    // MPW runtime helpers: long multiply/divide with arguments in D0, D1
    for (String[] t : rts) {
      Address s = a(Long.parseLong(t[1], 16));
      disassemble(s);
      Function f = getFunctionAt(s);
      if (f == null) f = createFunction(s, t[2]);
      if (f == null) continue;
      f.setName(t[2], SourceType.USER_DEFINED);
      List<Variable> ps = new ArrayList<>();
      ps.add(new ParameterImpl("a", IntegerDataType.dataType, currentProgram.getRegister("D0"), currentProgram));
      ps.add(new ParameterImpl("b", IntegerDataType.dataType, currentProgram.getRegister("D1"), currentProgram));
      f.updateFunction(null, new ReturnParameterImpl(IntegerDataType.dataType, currentProgram.getRegister("D0"), currentProgram),
          (List) ps, Function.FunctionUpdateType.CUSTOM_STORAGE, true, SourceType.USER_DEFINED);
      f.setNoReturn(false);
    }
    ReferenceManager rm = currentProgram.getReferenceManager();
    for (Object[] tr : traps) {
      Address from = a((Long) tr[0]);
      if (getInstructionAt(from) == null) disassemble(from);
      Reference ref = rm.addMemoryReference(from, trapAddr.get((String) tr[1]),
          RefType.CALLOTHER_OVERRIDE_CALL, SourceType.USER_DEFINED, -1);
      rm.setPrimary(ref, true);
    }
    analyzeAll(currentProgram);
    // decompile
    PrintWriter pw = new PrintWriter(new FileWriter(args[1]));
    DecompInterface d = new DecompInterface();
    d.openProgram(currentProgram);
    int n = 0;
    for (Function f : currentProgram.getFunctionManager().getFunctions(true)) {
      if (f.getEntryPoint().getOffset() < 0x10000 || f.getEntryPoint().getOffset() >= 0x00E00000L) continue;
      DecompileResults res = d.decompileFunction(f, 120, monitor);
      pw.println("//==== " + f.getName() + " @ " + f.getEntryPoint());
      if (res != null && res.decompileCompleted()) pw.println(res.getDecompiledFunction().getC());
      else pw.println("// FAILED " + (res != null ? res.getErrorMessage().replace("\n", " ") : ""));
      n++;
    }
    pw.close();
    println("decompiled " + n);
  }
}
