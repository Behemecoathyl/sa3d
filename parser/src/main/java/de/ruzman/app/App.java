package de.ruzman.app;

import java.awt.Desktop;
import java.io.File;
import java.net.URL;

import javafx.application.Application;
import javafx.concurrent.Task;
import javafx.event.EventHandler;
import javafx.fxml.FXMLLoader;
import javafx.scene.Scene;
import javafx.scene.image.Image;
import javafx.scene.input.DragEvent;
import javafx.scene.input.Dragboard;
import javafx.scene.input.TransferMode;
import javafx.scene.layout.StackPane;
import javafx.stage.Stage;

/**
 * GUI des Quellcode Parsers.
 */
public class App extends Application  {
	
	public static void main(String[] args) {
		Application.launch(App.class, args);
	}

	/**
	 * GUI beim Aufruf dieser Klasse vollständig initialisieren.
	 */
	@Override
	public void start(Stage primaryStage) throws Exception {			
		FXMLLoader loader = new FXMLLoader();
		loader.load(new File("resources/SA3D.fxml").toURL().openStream());
		Controller controller = (Controller) loader.getController();

		StackPane root = new StackPane(controller.getBackground());
		Scene scene = new Scene(root, 780, 480);
		primaryStage.setResizable(false);
		
		
		controller.getUpload().setOnDragOver(new EventHandler<DragEvent>() {
            @Override
            public void handle(DragEvent event) {
                Dragboard db = event.getDragboard();
                if (db.hasFiles()) {
                    event.acceptTransferModes(TransferMode.COPY);
                } else {
                    event.consume();
                }
            }
        });
        
		controller.getUpload().setOnDragDropped(new EventHandler<DragEvent>() {
            @Override
            public void handle(DragEvent event) {
                Dragboard db = event.getDragboard();
                boolean success = false;
                if (db.hasFiles()) {
                    success = true;
                    for (File file:db.getFiles()) {
                        if(file.isDirectory()) {
                        	Task<Void> parser = new Parser(file);
                        	controller.getProgress().progressProperty().setValue(0);
                        	controller.getProgress().progressProperty().bind(parser.progressProperty());
                        	new Thread(parser).start();
                        }
                    }
                }
                event.setDropCompleted(success);
                event.consume();
            }
        });
		
		
		primaryStage.setTitle("SA3D - Parser");
		primaryStage.setScene(scene);
		primaryStage.show();
   	}
	
	
}
