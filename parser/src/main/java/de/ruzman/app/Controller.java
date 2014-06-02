package de.ruzman.app;

import java.net.URL;
import java.util.ResourceBundle;

import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.scene.control.Button;
import javafx.scene.control.ProgressBar;
import javafx.scene.control.ProgressIndicator;
import javafx.scene.layout.VBox;

/**
 * GUI: Zugriff auf die FXML.
 */
public class Controller implements Initializable {
	@FXML private Button zone;
	@FXML private VBox background;
	@FXML private Button upload;
	@FXML private ProgressBar progress;
	
	public VBox getBackground() {
		return background;
	}
	
	public Button getUpload() {
		return upload;
	}
	
	public ProgressBar getProgress() {
		return progress;
	}
	
	@Override
	public void initialize(URL location, ResourceBundle resources) {
		progress.setProgress(0.001);
	}
}
