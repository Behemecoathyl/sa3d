package de.ruzman.app;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.json.simple.JSONArray;

import com.thoughtworks.qdox.JavaProjectBuilder;
import com.thoughtworks.qdox.model.JavaClass;

/**
 * Zur Ermittlung der Softwaremetriken (LOC, NOA, NOM, DIT, CBO, NOC, RFC) einzelner Klassen.
 */
public class Analyzer {
	private JavaProjectBuilder builder;
	private Map<String, Map<String, Object>> classes;
	
	/**
	 * Konstruktor - Initialisierung des SourceTrees.
	 */
	public Analyzer(JavaProjectBuilder builder, Map<String, Map<String, Object>> classes) {
		this.builder = builder;
		this.classes = classes;
	}
	
	/**
	 * Gibt die Anzahl der LOCs zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int getLinesOfCode(JavaClass javaClass) {
		return javaClass.getSource().getCodeBlock().split("\r\n|\r|\n").length;
	}
	
	/**
	 * Gibt die Anzahl der NOA zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int getNumberOfAttributes(JavaClass javaClass) {
		return javaClass.getFields().size();
	}
	
	/**
	 * Gibt die Anzahl der NOM zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int getNumberOfMethods(JavaClass javaClass) {
		return javaClass.getMethods().size();
	}
	
	/**
	 * Gibt die Super-Klasse zurück, sofern es eine gibt, ansonsten einen leeren String.
	 * @param javaClass Zu analysierende Klasse
	 */
	public String getParrentClass(JavaClass javaClass) {
		String parent = javaClass.getSuperClass().getFullyQualifiedName();		
		return classes.containsKey(parent) ? parent : "";
	}
	
	/**
	 * Gibt die DIT der Klasse zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int getDeptOfInherinaceTree(JavaClass javaClass) {
		int dept = 0;
		
		while(javaClass.getSuperJavaClass() != null 
				&& classes.containsKey(javaClass.getSuperJavaClass().getFullyQualifiedName())) {
			javaClass = javaClass.getSuperJavaClass();
			dept++;
		}
		
		return dept;
	}
	
	/**
	 * Gibt die NOC der Klasse zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int getNumberOfChildren(JavaClass javaClass) {
		return (int) classes.keySet().stream()
			.filter(s -> javaClass.getFullyQualifiedName().equals(
					builder.getClassByName(s).getSuperClass().getFullyQualifiedName()))
			.count();
	}
	
	/**
	 * Gibt die CBO der Klasse zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int getCouplingBetweenObjectClasses(JavaClass javaClass) {
		return (int) javaClass.getSource().getImports().stream()
				.filter(s -> classes.containsKey(s))
				.count();
	}
	
	/**
	 * Gibt die RFC der Klasse zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public int geResponseOfAClass(JavaClass javaClass) {
		List<String> realtions = javaClass.getSource().getImports().stream()
				.filter(s -> classes.containsKey(s))
				.filter(s -> !javaClass.getSuperClass().getFullyQualifiedName().equals(s))
				.collect(Collectors.toList());
		
		int rfc = javaClass.getMethods().size();
		
		for(String s: realtions) {
			rfc += builder.getClassByName(s).getMethods().size();
		}

		return rfc;
	}
	
	/**
	 * Gibt alle Beziehungen einer Klasse anhand der Importstatements zurück.
	 * @param javaClass Zu analysierende Klasse
	 */
	public JSONArray getRelatonship(JavaClass javaClass) {
		JSONArray list = new JSONArray();

		list.addAll(javaClass.getSource().getImports().stream()
				.filter(s -> classes.containsKey(s))
				.collect(Collectors.toList()));
				
		return list;
	}
}
