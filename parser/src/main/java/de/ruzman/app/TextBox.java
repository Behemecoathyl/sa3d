package de.ruzman.app;

import javafx.geometry.VPos;
import javafx.scene.Group;
import javafx.scene.shape.Rectangle;
import javafx.scene.text.FontSmoothingType;
import javafx.scene.text.Text;
import javafx.scene.text.TextAlignment;

public class TextBox extends Group {
	private Text text;
	private Rectangle box;

	public TextBox(String string, double width, double height) {
		box = new Rectangle(width, height);
		text = new Text(string);

		text.setTextAlignment(TextAlignment.CENTER);
		text.setTextOrigin(VPos.CENTER);
		text.setFontSmoothingType(FontSmoothingType.LCD);
		text.setClip(box);

		getChildren().addAll(text);
	}

	public Text getText() {
		return text;
	}

	public void setText(String string) {
		text.setText(string);
	}

	@Override
	protected void layoutChildren() {
		final double w = box.getWidth();
		final double h = box.getHeight();

		box.setWidth(w);
		box.setHeight(h);
		box.setLayoutX(0);
		box.setLayoutY(-h / 2);

		text.setWrappingWidth(w * 0.9);
		text.setLayoutX(w / 2 - text.getLayoutBounds().getWidth() / 2);
		text.setLayoutY(h / 2);
	}
}
