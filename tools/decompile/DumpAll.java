// Ghidra script: decompile every function in the program to one C file.
// Usage (headless): analyzeHeadless <projdir> <name> -import <exe> -scriptPath tools/decompile -postScript DumpAll.java <out.c>
// See docs/decompiling.md.
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.program.model.listing.*;
import java.io.*;
public class DumpAll extends GhidraScript {
  public void run() throws Exception {
    String out = getScriptArgs()[0];
    PrintWriter pw = new PrintWriter(new FileWriter(out));
    DecompInterface d = new DecompInterface();
    d.openProgram(currentProgram);
    FunctionIterator it = currentProgram.getFunctionManager().getFunctions(true);
    int n=0;
    while (it.hasNext()) {
      Function f = it.next();
      DecompileResults r = d.decompileFunction(f, 120, monitor);
      pw.println("//==== " + f.getName() + " @ " + f.getEntryPoint());
      if (r != null && r.decompileCompleted()) pw.println(r.getDecompiledFunction().getC());
      else pw.println("// FAILED");
      n++;
    }
    pw.close();
    println("decompiled " + n);
  }
}
