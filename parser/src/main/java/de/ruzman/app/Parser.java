package de.ruzman.app;

import java.awt.Desktop;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.net.URISyntaxException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

import javafx.concurrent.Task;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

import com.thoughtworks.qdox.JavaProjectBuilder;
import com.thoughtworks.qdox.model.JavaClass;

/**
 * Parst ein Softwareprojekt in einen Thread.
 */
public class Parser extends Task<Void> {
	private ClassTree tree;
	private JavaProjectBuilder builder;
	private JSONObject output = new JSONObject();
	private Map<String, JSONArray> packages;
	private Map<String, Map<String, Object>> classes;
	private Analyzer analyzer;
	private File file;
	
	/**
	 * Konstruktor - Initialisierung des Projekts.
	 */
	public Parser(File file) {
		this.file = file;
		this.tree = new ClassTree(".", "\\.");
		this.builder = new JavaProjectBuilder();
		this.packages = new HashMap<>();
		this.classes = new HashMap<>();
		this.analyzer = new Analyzer(builder, classes);
	}
	
	@Override
	protected Void call() throws Exception {
		init();		
		return null;
	}

	private void init() {		
		builder.addSourceTree(file);
		builder.getClasses().stream()
			.filter(c -> (!c.isAnnotation() && !c.isInterface() && !c.isInner() && !c.isEnum()))
			.forEach(c -> tree.parseElement(c.getFullyQualifiedName()));
		
		recParse(tree.getMostCommonNode());
		
		classes.values().forEach(this::initClass);
		
		try (BufferedReader reader = Files.newBufferedReader(
				Paths.get(new File("resources/index").toURI()));
			 BufferedWriter out = new BufferedWriter(
					 new OutputStreamWriter(
				  	 new FileOutputStream("output/index.html"), "UTF-8"));
			 BufferedWriter out2 = new BufferedWriter(
					 new OutputStreamWriter(
					 new FileOutputStream("output/output.json"), "UTF-8"));) {
		    String line = null;
		    while ((line = reader.readLine()) != null) {
		  		out.write(line.replaceAll("<textarea id=\"ta_input\">", "<textarea id=\"ta_input\">" + output.toJSONString()));
		  		out.newLine();
		    }
		    
		    out2.write(output.toJSONString());
		    
		    Desktop.getDesktop().browse(new File("output/index.html").toURI());
		} catch (Exception x) {
		    x.printStackTrace();
		}
		
        updateProgress(1, 1);
	}	
	
	/**
	 * Initialisierung der einzelnen Klassen.
	 */
	private void initClass(Map<String, Object> map) {
		JavaClass javaClass = builder.getClassByName((String) map.get("fullName"));
		map.put("LOC", analyzer.getLinesOfCode(javaClass));
		map.put("NOM", analyzer.getNumberOfAttributes(javaClass));
		map.put("NOA", analyzer.getNumberOfMethods(javaClass));
		map.put("DIT", analyzer.getDeptOfInherinaceTree(javaClass));
		map.put("NOC", analyzer.getNumberOfChildren(javaClass));
		map.put("CBO", analyzer.getCouplingBetweenObjectClasses(javaClass));
		map.put("RFC", analyzer.geResponseOfAClass(javaClass));
		map.put("parentClass", analyzer.getParrentClass(javaClass));
		map.put("relatedTo", analyzer.getRelatonship(javaClass));
		map.put("size", analyzer.geResponseOfAClass(javaClass));
	}
	
	public void recParse(ClassNode classNode) {
		recParse(classNode, classNode.getIncrementedPath());
	}
	
	/**
	 * Bildet die Projektstruktur in einer JSON-Datei ab.
	 */
	private void recParse(ClassNode classNode, String consumedPath) {		
		while(classNode.getChilds().size() == 1 && !classNode.getChilds().get(0).isLeaf()) {
			classNode = classNode.getChilds().get(0);
		}
		String path = classNode.getIncrementedPath();
		
		if(output.get("name") == null) {
			output.put("name", consumedPath.isEmpty() ? "Projekt" : consumedPath);
			output.put("children", createJSONArray(consumedPath));
			output.put("fullName", consumedPath.isEmpty() ? "" : consumedPath);
		} else {
			createEntry(consumedPath, classNode.getIncrementedPath());
		}
		
		for(ClassNode child: classNode.getChilds()) {
			if(child.isLeaf()) {				
				Map<String, Object> map = new HashMap<String, Object>();
				map.put("name", child.getName());
				map.put("fullName", child.getIncrementedPath());
				classes.put(child.getIncrementedPath(), map);
				packages.get(classNode.getIncrementedPath()).add(map);
			} else {
				recParse(child, path);
			}
		}
		
	}

	private Map<String, Object> createEntry(String consumedPath, String fullQualifiedName) {
		Map<String, Object> map = new HashMap<>();
		String name = fullQualifiedName.substring(consumedPath.length());
		if(name.startsWith(tree.getSeperator())) {
			name = name.substring(1);
		}
		
		map.put("name", name);
		map.put("children", createJSONArray(fullQualifiedName));
		map.put("fullName", fullQualifiedName);
		packages.get(consumedPath).add(map);
		return map;
	}
	
	private JSONArray createJSONArray(String path) {
		JSONArray value = new JSONArray();
		packages.put(path, value);
		return value;
	}
}
