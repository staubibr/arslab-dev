package parsers.cdpp;

import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import components.Utilities;
import models.Message;
import models.Model;
import models.Parsed;
import models.Simulation;
import shared.Ma;

public class Devs {

	private static List<Message> messages;
		
	public static Parsed Parse(String name, InputStream ma, InputStream log)  throws IOException {		
		List<Model> models = Ma.Parse(ma).stream().map(m -> (Model)m).collect(Collectors.toList());
		
		Simulation sim = new Simulation(name, "Cell-DEVS", "CDpp", models);
		
		messages = ParseLog(models, log);
		
		return new Parsed(sim, messages);
	}
		
	private static List<Message> ParseLog(List<Model> models, InputStream log) throws IOException {
		messages = new ArrayList<Message>();
		
		List<Model> coupled = models.stream().filter(md -> md.getType().equals("coupled")).collect(Collectors.toList());
		
		Utilities.ReadFile(log, (String l) -> {
			// Mensaje Y / 00:00:20:000 / top(01) / packetsent /      1.00000 para Root(00)
			if (!l.startsWith("Mensaje Y")) return;
			
			String[] split = Arrays.stream(l.split("/")).map(s -> s.trim()).toArray(String[]::new);
			
			String[] tmp1 = split[2].split("\\("); 
			String[] tmp2 = split[4].trim().split(" ");

			String m = tmp1[0];		// model name
			 			 
			Optional<Model> model = coupled.stream().filter(md -> md.getName().equals(m)).findFirst();
			 
			if (model.isPresent()) return;	// Message corresponds to coupled model, we don't want those.
			 			 			 	
			String t = split[1];	// time
			String p = split[3];	// port
			String v = tmp2[0];		// value

			// Magic
			BigDecimal number = new BigDecimal(v);  
			
			v = number.stripTrailingZeros().toPlainString();
			
			messages.add(new Message(t, m, p, v));
		});
		
		return messages;
	}
}