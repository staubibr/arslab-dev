package parsers.shared;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import components.Utilities;
import models.InitialRowValues;
import models.Link;
import models.Model;
import models.ModelCdpp;
import models.Port;

public class Ma {

	private static ModelCdpp current;
	
	public static List<ModelCdpp> Parse(InputStream ma) throws IOException {
		ArrayList<ModelCdpp> models = new ArrayList<ModelCdpp>();
		ArrayList<Link> links = new ArrayList<Link>();
		ArrayList<String> ignore = new ArrayList<String>();
				
		Utilities.ReadFile(ma, (String l) -> {
			l = l.trim().toLowerCase();
			
			if (l.startsWith("[")) {
				String name = l.substring(1, l.length() - 1);
				
				if (ignore.contains(name)) return; 
				
				current = new ModelCdpp(name);
				
				models.add(current);
				
				return;
			}
			
			if (!l.contains(":")) return;
			
			String left = l.split(":")[0].trim();
			String right = l.split(":")[1].trim();

			if (left.equals("components")) {
				// components : sender@Sender
				current.submodels.add(right.split("@")[0]);
			}

			else if (left.equals("link")) {
				// Link : dataOut@sender in1@Network
				String[] ports = right.split("\\s+");
				String[] lPort = ports[0].split("@");
				String[] rPort = ports[1].split("@");
				
				Link link = new Link();
				
				link.modelA = lPort.length == 1 ? current.name : lPort[1];
				link.portA = lPort[0];
				link.portB = rPort[0];
				link.modelB = rPort.length == 1 ? current.name : rPort[1];
				
				links.add(link);
			}
			
			else if (left.equals("dim")) {
				// dim : (30, 30)
				String tmp = right.replaceAll(" ", "");
				
				String[] dim = tmp.substring(1, tmp.length() - 1).split(",|, ");
				
				current.size = new int[3];

				current.size[0] = Integer.parseInt(dim[0]);
				current.size[1] = Integer.parseInt(dim[1]);
				current.size[2] = (dim.length == 2) ? 1 : Integer.parseInt(dim[2]);
			}
			
			else if (left.equals("height")) current.size[0] = Integer.parseInt(right);
			
			else if (left.equals("width")) current.size[1] = Integer.parseInt(right);
			
			else if (left.equals("neighborports")) {
				// NeighborPorts: scenario1 scenario2 scenario3 scenario4
				current.ports = Arrays.stream(right.split(" "))
									  .map(p -> new Port(p, "output"))
									  .collect(Collectors.toList());
			}
			
			else if (left.equals("initialvalue")) {
				// initialvalue : 0
				current.initialValue = right;
			}
			
			else if (left.equals("initialrowvalue")) {
				// initialrowvalue :  1      00111011100011100200
				String[] split = right.split("\\s+");
				
				InitialRowValues rv = new InitialRowValues();
				
				rv.row = Integer.parseInt(split[0]);
				
				for (int i = 0; i < split[1].length(); i++) {
				    char c = split[1].charAt(i);        

					rv.values.add(String.valueOf(c));
				}
				
				current.initialRowValues.add(rv);								
			}
			
			else if (left.equals("localtransition") || left.equals("zone")) {
				// localtransition : RegionBehavior
				ignore.add(right);
			}
		});
		
		links.forEach((Link l) -> {
			Model mA = models.stream()
							 .filter((Model m) -> m.name.equals(l.modelA))
							 .findFirst()
							 .orElse(null);
			
			Port pA = mA.ports.stream()
							  .filter((Port p) -> p.name.equals(l.portA))
							  .findFirst()
							  .orElse(null);
			
			if (pA == null) mA.ports.add(new Port(l.portA, "output"));
			
			Model mB = models.stream()
							 .filter((Model m) -> m.name.equals(l.modelB))
							 .findFirst()
							 .orElse(null);
			
			
			Port pB = mB.ports.stream()
							  .filter((Port p) -> p.name.equals(l.portB))
							  .findFirst()
							  .orElse(null);
			
			if (pB == null) mB.ports.add(new Port(l.portB, "input"));
			
			mA.links.add(new Link(l.modelA, l.portA, l.modelB, l.portB));
		});
		
		return models;
	}
}