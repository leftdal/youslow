package com.testyoutube;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;

import org.achartengine.GraphicalView;

import android.app.ActionBar.LayoutParams;
import android.app.Activity;
import android.content.Context;
import android.graphics.Color;
import android.os.Bundle;
import android.widget.LinearLayout;
import android.widget.ScrollView;

public class PiechartActivity extends Activity  {
	
	// For different ISPs, need to create different layouts and views
	private Map<String, String> map = new HashMap<String, String>();
	
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);          
        getActionBar().setTitle(" Played bitrates for different ISPs");
                
        LinearLayout parent=new LinearLayout(this); 
        parent.setOrientation(LinearLayout.VERTICAL); 
        
        getISP(this);
		Set<String> keyset = map.keySet();
		String[] ISP = keyset.toArray(new String[keyset.size()]);
		
        for (int i=0; i<ISP.length; i++){
        	if(ISP[i].equals("")){
        		continue;
        	}
            LinearLayout layout = new LinearLayout(this);
            layout.setLayoutParams(new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 600));    
            layout.setBottom(30);
            layout.setOrientation(LinearLayout.VERTICAL);
            
            GraphicalView piechart = new PieChart(ISP[i], readInfo(this, ISP[i])).execute(this); 
            layout.addView(piechart, new LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT));               
            parent.addView(layout);
        }
         
        ScrollView scroll = new ScrollView(this);
        scroll.setBackgroundColor(Color.BLACK);
        scroll.setLayoutParams(new LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        scroll.addView(parent);
        
        setContentView(scroll);      	
	}
	
	private void getISP(Context context){
		String[] History = new String[20];
		    
		int n = 0; // Count number of records
        try {
     	    FileInputStream inStream = context.openFileInput("recentrecords.txt");
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int length = -1;
            while((length=inStream.read(buffer)) != -1){
                stream.write(buffer,0,length);
            } 
            
            String records = stream.toString();
            stream.close();
            inStream.close();   
            
            Scanner src = new Scanner(records); 
    	    src.useDelimiter("/");
    	    while(src.hasNext()){ 
    	    	History[n] = src.next();
    	   	   	n++;
            }
   	        src.close();            
   	        
			String label="";
			String data=""; 			
			
			String ispname = "";
			
			// Collecting isp kinds
			for (int h=0; h<n; h++){
			 	Scanner sc = new Scanner(History[h]);  
			    sc.useDelimiter("&|=");
				while(sc.hasNext()){
					if(sc.hasNext()) label = sc.next(); 
					if(sc.hasNext()) data = sc.next();
					
					if(label.equals("org")){
						ispname = data;					    
					    map.put(ispname, ispname);
					}
					label="";
					data="";
			    }
			    sc.close();		
		    }	
        }catch (FileNotFoundException e){
        }
        catch (IOException e){
        }
	}
	
	// Getting information from data we stored for different ISPs
	private double[] readInfo(Context context, String chartTitle){
		String[] History = new String[20];
		double[] value = new double[6]; 
		    
		int n = 0; // Count number of records
        try {
     	    FileInputStream inStream = context.openFileInput("recentrecords.txt");
            ByteArrayOutputStream stream = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int length = -1;
            while((length=inStream.read(buffer)) != -1){
                stream.write(buffer,0,length);
            } 
            
            String records = stream.toString();
            stream.close();
            inStream.close();   
            
            Scanner src = new Scanner(records); 
    	    src.useDelimiter("/");
    	    while(src.hasNext()){ 
    	    	History[n] = src.next();
    	   	   	n++;
            }
   	        src.close();            
   	        
			String label="";
			String data=""; 			
			
			String ispname = "";
			 
			// Extracting and calculating data
			for (int h = 0; h<n ; h++){
			 	Scanner sc = new Scanner(History[h]);  
			    sc.useDelimiter("&|=");
				while(sc.hasNext()){
					if(sc.hasNext()) label = sc.next(); 
					if(sc.hasNext()) data = sc.next();
					
					if(label.equals("org")){
						ispname = data;
					}
					
					if(ispname.equals(chartTitle)&&label.equals("requestedresolutionswithtime")){
						Scanner sa = new Scanner(data);
						sa.useDelimiter(":");
						while(sa.hasNext()){
							String resol = sa.next();
							String[] result = resol.split("[?]");
							if(result[1].equals("small")){
								value[0] += Double.parseDouble(result[0]);
							}
							else if(result[1].equals("medium")){
								value[1] += Double.parseDouble(result[0]);
							}
							else if(result[1].equals("large")){
								value[2] += Double.parseDouble(result[0]);
							}
							else if(result[1].equals("hd720")){
								value[3] += Double.parseDouble(result[0]);
							}
							else if(result[1].equals("hd1080")){
								value[4] += Double.parseDouble(result[0]);
							}
							else if(result[1].equals("highres")){
								value[5] += Double.parseDouble(result[0]);
							}
						}
						sa.close();
						
					}
					label="";
				 	data=""; 
			    }
			    sc.close();			     
		    }        
             
        }catch (FileNotFoundException e){
            return new double[6];
        }
        catch (IOException e){
            return new double[6];
        }
        return value;
	}
}
