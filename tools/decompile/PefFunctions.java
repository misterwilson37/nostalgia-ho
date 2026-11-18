// Post-analysis script for a PowerPC PEF (Spaceward Ho! 5.x, 4.x PowerPC halves): Ghidra's analysis misses the
// routines reached only through virtual tables. This makes a function at every 4-byte-aligned address in the
// executable blocks that follows a blr (0x4e800020) or a bctr (0x4e800420) and is not already in a function,
// at every mflr r0 / stwu r1 prologue not in one, and at every code address stored in the data blocks,
// then lets the analysis run again. Usage: -postScript PefFunctions.java (before DumpAll.java). Prints the count added.
import ghidra.app.script.GhidraScript;
import ghidra.program.model.address.*;
import ghidra.program.model.mem.*;
import ghidra.app.cmd.disassemble.DisassembleCommand;
public class PefFunctions extends GhidraScript {
  public void run() throws Exception {
    int added = 0, prol = 0, ptr = 0;
    for (int pass = 0; pass < 3; pass++) {
      int addedPass = 0;
      for (MemoryBlock b : currentProgram.getMemory().getBlocks()) {
        if (!b.isExecute() || !b.isInitialized()) continue;
        Address a = b.getStart();
        while (a.compareTo(b.getEnd()) < 0) {
          Address next = a.add(4);
          if (next.compareTo(b.getEnd()) >= 0) break;
          int w = getInt(a);
          if ((w == 0x4e800020 || w == 0x4e800420) && getFunctionContaining(next) == null) {
            int nw = getInt(next);
            if (nw != 0 && getDataAt(next) == null) {
              disassemble(next);
              if (getInstructionAt(next) != null && createFunction(next, null) != null) { added++; addedPass++; }
            }
          }
          if (getFunctionContaining(a) == null && ((w == 0x7c0802a6) || ((w >>> 16) == 0x9421)) && getDataAt(a) == null) {
            disassemble(a);
            if (getInstructionAt(a) != null && createFunction(a, null) != null) { added++; addedPass++; prol++; }
          }
          a = next;
        }
      }
      // code addresses stored in the data (virtual tables, TVectors, switch tables)
      for (MemoryBlock b : currentProgram.getMemory().getBlocks()) {
        if (b.isExecute() || !b.isInitialized()) continue;
        for (Address a = b.getStart(); a.compareTo(b.getEnd().subtract(3)) < 0; a = a.add(4)) {
          long v = getInt(a) & 0xffffffffL;
          Address t;
          try { t = toAddr(v); } catch (Exception e) { continue; }
          MemoryBlock tb = currentProgram.getMemory().getBlock(t);
          if (tb == null || !tb.isExecute() || (v & 3) != 0) continue;
          if (getFunctionAt(t) != null || getFunctionContaining(t) != null) continue;
          disassemble(t);
          if (getInstructionAt(t) != null && createFunction(t, null) != null) { added++; addedPass++; ptr++; }
        }
      }
      if (addedPass == 0) break;
      analyzeChanges(currentProgram);
    }
    println("functions added " + added + " (after a return " + (added - prol - ptr) + ", at a prologue " + prol + ", pointed at from data " + ptr + ")");
  }
}
