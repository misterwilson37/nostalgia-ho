// Ghidra script: name functions from an Objective-C method list (addr<TAB>name<TAB>types), then decompile every function to one C file.
// Args: <objc.tsv> <out.c>
import ghidra.app.script.GhidraScript;
import ghidra.app.decompiler.*;
import ghidra.program.model.listing.*;
import ghidra.program.model.address.*;
import ghidra.program.model.symbol.*;
import java.io.*;
import java.util.*;
public class NameDump extends GhidraScript {
  public void run() throws Exception {
    String[] a = getScriptArgs();
    Map<Long,String> names = new HashMap<>();
    BufferedReader br = new BufferedReader(new FileReader(a[0]));
    String l;
    while ((l = br.readLine()) != null) { String[] p = l.split("\t"); names.put(Long.parseLong(p[0],16), p[1]); }
    br.close();
    FunctionManager fm = currentProgram.getFunctionManager();
    int made = 0;
    for (Map.Entry<Long,String> e : names.entrySet()) {
      Address ad = toAddr(e.getKey());
      if (fm.getFunctionAt(ad) == null) { try { createFunction(ad, null); made++; } catch (Exception x) {} }
    }
    println("created " + made + " functions");
    PrintWriter pw = new PrintWriter(new FileWriter(a[1]));
    DecompInterface d = new DecompInterface();
    d.openProgram(currentProgram);
    FunctionIterator it = fm.getFunctions(true);
    int n = 0, fail = 0;
    while (it.hasNext()) {
      Function f = it.next();
      String oc = names.get(f.getEntryPoint().getOffset());
      String nm = oc == null ? f.getName() : oc.replaceAll("[^A-Za-z0-9_]", "_").replaceAll("_+", "_");
      pw.println("//==== " + nm + " @ " + f.getEntryPoint() + (oc == null ? "" : "   // " + oc));
      DecompileResults r = d.decompileFunction(f, 120, monitor);
      if (r != null && r.decompileCompleted()) pw.println(r.getDecompiledFunction().getC()); else { pw.println("// FAILED"); fail++; }
      n++;
    }
    pw.close();
    println("decompiled " + n + " failed " + fail);
  }
}
