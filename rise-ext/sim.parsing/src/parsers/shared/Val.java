package parsers.shared;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import components.Utilities;
import models.MessageCA;
import models.Model;

public class Val {

	public static List<MessageCA> Parse(InputStream val, Model model) throws IOException {
		// (0,0,0)=100
		ArrayList<MessageCA> messages = new ArrayList<MessageCA>();
		
		Utilities.ReadFile(val, (String l) -> {
			// probably empty line
			if (l.isBlank() || l.length() < 4) return;

			if (!l.startsWith("(")) throw new RuntimeException("File format does not correspond to a val file.");
			
			int cI = l.indexOf('('); // coordinate start
			int cJ = l.indexOf(')'); // coordinate end
			int vI = l.indexOf('='); // value start

			String[] c = l.substring(cI + 1, cJ).replaceAll("\\s+", "").split(",");
			int[] coord = Arrays.stream(c).mapToInt(s -> Integer.parseInt(s)).toArray(); 
			
			String value = l.substring(vI + 1);
			
			messages.add(new MessageCA("00:00:00:000", model.name, coord, "out", value));
		});
		
		return messages;
	}
}