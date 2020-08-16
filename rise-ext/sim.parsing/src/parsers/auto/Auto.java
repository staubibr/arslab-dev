package parsers.auto;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map.Entry;

import components.FilesMap;
import components.Helper;
import models.Parsed;
import parsers.IParser;

public class Auto implements IParser {
		
	public Parsed Parse(FilesMap files) throws IOException {
		files.Mark(0);
		
		IParser parser = DetectParser(files);

		files.Reset();
				
		if (parser == null) throw new RuntimeException("Unable to automatically detect parser from files.");
		
		return parser.Parse(files);
	}
	
	private IParser DetectParser(FilesMap files) throws IOException {
		String ma = files.FindKey(".ma");
		String log = files.FindKey(".log");

		// .ma file if Lopez or CDpp. First check log file to see if Lopez or CDpp
		if (ma != null) {
			List<String> lines = Helper.ReadNLines(files.get(log), 3);
			
			// 0 / L / Y is the Lopez format, as far as I know, Lopez only does Cell-DEVS
			if (lines.get(0).contains("0 / L / Y")) return new parsers.lopez.CellDevs();
			
			// CDpp Cell-DEVS will contain ')(' sequence because of coordinates (ie. ...para food_chain(0,0)(03))
			// TODO: This is super shifty but it should work unless someone puts )( in the model name
			else if (lines.get(2).contains("\\)\\(")) return new parsers.cdpp.CellDevs();
			
			// Only format left is CDpp DEVS
			else return new parsers.cdpp.Devs();
		}
		
		return null;
	}
}
