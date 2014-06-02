package de.ruzman.app;

import java.util.Optional;

/**
 * Datenstruktur für einen speziellen Baum.
 * Beim der Initalisierung wird ein Seperator (z.B. "->") festgelegt.
 * Die Knoten werden durch den Seperator verbunden.
 * Über die parseElement-Methode wird dann ein entsprechender Baum mit unikaten Knoten erstellt.
 *
 * Beispiel-Input:
 * root->test->ordner
 * root->test->ZweiterOrdner
 * root->abc
 */
public class ClassTree {	
	private ClassNode root;
	private String seperator;
	private String regexSeperator;
	
	/**
	 * Konstruktor - Baum mit einem Seperator initialisieren.
	 */
	public ClassTree(String seperator, String regexSeperator) {
		this.seperator = seperator;
		this.regexSeperator = regexSeperator;
		this.root = new ClassNode(ClassNode.ROOT_TAG, "");
	}
	
	/**
	 * Element mit seinen kompletten Pfad einlesen.
	 */
	public void parseElement(String leafString) {
		String[] elements = leafString.split(regexSeperator);
		ClassNode currentElement = root;
		
		for(String s: elements) {
			Optional<ClassNode> nextElement = currentElement.getChilds().stream()
					.filter(e -> e.getName().equals(s)).findFirst();

			if(nextElement.isPresent()) {
				currentElement = nextElement.get();
			} else {
				ClassNode nextElement2 = new ClassNode(s, currentElement.getIncrementedPath() 
						+ (currentElement.isRoot() ? "" : seperator) + s);
				currentElement.addChild(nextElement2);
				currentElement = nextElement2;
			}
		}	
	}
	
	/**
	 * Gibt die Wurzel des Baumes zurück.
	 */
	public ClassNode getRoot() {
		return root;
	}
	
	/**
	 * Gibt den Knoten zurück, der nach der Wurzel mehr als ein Kind besitzt.
	 */
	public ClassNode getMostCommonNode() {
		return getMostCommonNode(root);
	}
	
	/**
	 * Gibt den Knoten zurück, der nach <code>classNode</code> mehr als ein Kind besitzt.
	 */
	public ClassNode getMostCommonNode(ClassNode classNode) {
		return classNode.getChilds().size() == 1 ? getMostCommonNode(classNode.getChilds().get(0)) : classNode;
	}
	
	/**
	 * Baum in der Konsole strukturiert ausgeben.
	 */
	public void print() {
		root.printNode();
	}

	/**
	 * Gibt den Seperator des Baums zurück.
	 */
	public String getSeperator() {
		return seperator;
	}
}
