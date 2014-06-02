package de.ruzman.app;

import java.util.ArrayList;
import java.util.List;

/**
 * Repräsentiert einen Knoten von einem Baum (ClassTree).
 */
public class ClassNode {
	public static final String ROOT_TAG = "#ROOT234!$$";
	
	private String name;
	private String incrementedPath;
	private List<ClassNode> childs;
	
	public ClassNode(String name, String incrementedPath) {
		this.name = name;
		this.incrementedPath = incrementedPath;
		this.childs = new ArrayList<>();
	}
	
	/**
	 * Dem Knoten ein Kind anhängen.
	 * @param classNode Anzuhängender Knoten
	 */
	public void addChild(ClassNode classNode) {
		childs.add(classNode);
	}
	
	/**
	 * Struktur ab diesen Knoten in der Konsole ausgeben.
	 */
	public void printNode() {
		if(isRoot()) {
			printNode(-2);
		} else {
			printNode(0);
		}
	}
	
    private void printNode( int increment ) {
        for (int i = 0; i < increment; i++) {
            System.out.print(" ");
        }
        if(!isRoot()) {
        	System.out.println(incrementedPath);
        }
        
        for( ClassNode n: childs)
            n.printNode(increment+2);
    }
	
	/**
	 * Ob es sich bei dem Knoten um die Wurzel handelt.
	 */
    public boolean isRoot() {
    	return ROOT_TAG.equals(name);
    }
    
	/**
	 * Gibt die Anzahl der Kinder zurück.
	 */
	public List<ClassNode> getChilds() {
		return childs;
	}
	
	/**
	 * Gibt den Namen des Knoten in Textform zurück.
	 */
	public String getName() {
		return name;
	}
	
	/**
	 * Gibt den Pfad+Namen des Knoten in Textform zurück.
	 */
	public String getIncrementedPath() {
		return incrementedPath;
	}

	/**
	 * Ob es sich bei dem Knoten um ein Blatt handelt.
	 */
	public boolean isLeaf() {
		return childs.isEmpty();
	}
}
