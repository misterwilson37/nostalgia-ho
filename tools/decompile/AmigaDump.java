// Ghidra script for the Amiga program of Spaceward Ho! (flat.bin from tools/extract/amiga-code.py):
// sets A4 = 0x200000 over the code, disassembles from 0x100000, then writes the listing and the
// decompiled C of every function. See docs/amiga-21.md.
// Usage (headless):
//   analyzeHeadless <projdir> p -import flat.bin -loader BinaryLoader -loader-baseAddr 0x100000 \
//     -processor 68000:BE:32:MC68020 -scriptPath tools/decompile \
//     -postScript AmigaDump.java <code end address, e.g. 0x12a663> <out prefix>
// (the code ends at 0x100000 + the size of hunk1.bin - 1); writes <prefix>.asm and <prefix>.c
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.program.model.lang.Register;
import ghidra.program.model.listing.*;
import java.io.*;
import java.math.BigInteger;
public class AmigaDump extends GhidraScript {
  public void run() throws Exception {
    String[] a = getScriptArgs();
    Register a4 = currentProgram.getRegister("A4");
    currentProgram.getProgramContext().setValue(a4, toAddr(0x100000), toAddr(Long.decode(a[0])), BigInteger.valueOf(0x200000));
    disassemble(toAddr(0x100000));
    createFunction(toAddr(0x100000), "entry");
    Listing l = currentProgram.getListing();
    PrintWriter w = new PrintWriter(new FileWriter(a[1] + ".asm"));
    Function cur = null;
    for (InstructionIterator it = l.getInstructions(true); it.hasNext();) {
      Instruction ins = it.next();
      Function f = getFunctionContaining(ins.getAddress());
      if (f != null && f != cur) { w.println("; ---- " + f.getName()); cur = f; }
      w.println(ins.getAddress() + ": " + ins.toString());
    }
    w.close();
    DecompInterface d = new DecompInterface();
    d.openProgram(currentProgram);
    w = new PrintWriter(new FileWriter(a[1] + ".c"));
    int n = 0;
    for (FunctionIterator it = currentProgram.getFunctionManager().getFunctions(true); it.hasNext(); n++) {
      Function f = it.next();
      DecompileResults r = d.decompileFunction(f, 120, monitor);
      w.println("// ==== " + f.getName() + " @ " + f.getEntryPoint());
      w.println(r != null && r.getDecompiledFunction() != null ? r.getDecompiledFunction().getC() : "// decompile failed");
    }
    w.close();
    println("functions: " + n);
  }
}
