// Ghidra script for the flat real-mode image of a Borland C++ DOS program with VROOMM overlays (made by tools/decompile/dos-flat.py): sets DS over the whole image,
// makes a function at each overlay entry point (the entries file: "segment offset" in hex, one per line) and at each 55 8B EC (push bp; mov bp, sp) prologue inside the code
// that analysis has not reached, then decompiles every function to one C file.
//   analyzeHeadless <proj> <name> -import dosho.flat -loader BinaryLoader -loader-baseAddr 1000:0000 -processor x86:LE:16:Real\ Mode -scriptPath tools/decompile \
//     -postScript DosHo.java <out.c> <entries.txt> <ds segment hex> <last code linear end hex>
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.app.cmd.disassemble.DisassembleCommand;
import ghidra.app.cmd.function.CreateFunctionCmd;
import ghidra.program.model.address.*;
import ghidra.program.model.lang.*;
import ghidra.program.model.listing.*;
import ghidra.program.model.mem.*;
import java.io.*;
import java.math.BigInteger;
import java.util.*;
public class DosHo extends GhidraScript {
  public void run() throws Exception {
    String[] a = getScriptArgs();
    AddressSpace sp = currentProgram.getAddressFactory().getDefaultAddressSpace();
    Register ds = currentProgram.getLanguage().getRegister("DS");
    long dsSeg = Long.parseLong(a[2], 16), endLin = Long.parseLong(a[3], 16);
    AddressSet all = new AddressSet(currentProgram.getMemory());
    for (AddressRange r : all) currentProgram.getProgramContext().setValue(ds, r.getMinAddress(), r.getMaxAddress(), BigInteger.valueOf(dsSeg));
    int made = 0;
    for (String l : java.nio.file.Files.readAllLines(new File(a[1]).toPath())) {
      String[] t = l.trim().split("\\s+"); if (t.length < 2) continue;
      Address ad = sp.getAddress(t[0] + ":" + t[1]);
      DisassembleCommand dc = new DisassembleCommand(ad, null, true); dc.applyTo(currentProgram, monitor);
      if (getFunctionAt(ad) == null && new CreateFunctionCmd(ad).applyTo(currentProgram, monitor)) made++;
    }
    println("entry functions " + made);
    // prologues the analysis did not reach
    Memory m = currentProgram.getMemory(); Address min = all.getMinAddress(), max = all.getMaxAddress();
    byte[] pat = {0x55, (byte)0x8b, (byte)0xec}; int extra = 0;
    Address cur = min;
    while (cur != null && cur.compareTo(max) < 0) {
      Address f = m.findBytes(cur, pat, null, true, monitor);
      if (f == null) break;
      if (getFunctionContaining(f) == null && getInstructionAt(f) == null) {
        DisassembleCommand dc = new DisassembleCommand(f, null, true); dc.applyTo(currentProgram, monitor);
        if (getFunctionAt(f) == null && new CreateFunctionCmd(f).applyTo(currentProgram, monitor)) extra++;
      }
      try { cur = f.add(1); } catch (Exception e) { break; }
    }
    println("prologue functions " + extra);
    PrintWriter pw = new PrintWriter(new FileWriter(a[0]));
    DecompInterface d = new DecompInterface(); d.openProgram(currentProgram);
    int n = 0;
    for (Function f : currentProgram.getFunctionManager().getFunctions(true)) {
      DecompileResults r = d.decompileFunction(f, 60, monitor);
      pw.println("//==== " + f.getName() + " @ " + f.getEntryPoint());
      if (r != null && r.decompileCompleted()) pw.println(r.getDecompiledFunction().getC()); else pw.println("// FAILED");
      n++;
    }
    pw.close(); println("decompiled " + n);
  }
}
