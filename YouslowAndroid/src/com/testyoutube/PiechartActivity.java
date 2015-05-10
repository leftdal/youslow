package com.testyoutube;

import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Scanner;

import org.achartengine.GraphicalView;

import android.app.ActionBar.LayoutParams;
import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.widget.LinearLayout;

public class PiechartActivity extends Activity  {
	
	// For different ISPs, need to create different layouts and views
	private LinearLayout pie1;	
	private LinearLayout pie2;
	private LinearLayout pie3;
	private LinearLayout pie4;
	private GraphicalView piechart1;
	private GraphicalView piechart2;
	private GraphicalView piechart3;
	private GraphicalView piechart4;
	
	
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);  
        setContentView(R.layout.activity_piechart);
        
        getActionBar().setTitle("Played bitrates for different ISPs");
        
        pie1 = (LinearLayout) findViewById(R.id.piechart1);
        pie2 = (LinearLayout) findViewById(R.id.piechart2);
        pie3 = (LinearLayout) findViewById(R.id.piechart3);
        pie4 = (LinearLayout) findViewById(R.id.piechart4);        
        
        // The isp name may not be correct.
        piechart1 = new PieChart("4G: VERIZON", readInfo(this, "verizon")).execute(this); 
        piechart2 = new PieChart("WIFI: VERIZON", readInfo(this, "verizon")).execute(this); 
        piechart3 = new PieChart("WIFI: COMCAST", readInfo(this, "Comcast")).execute(this); 
        piechart4 = new PieChart("WIFI: COLUMBIA", readInfo(this, "AS14ColumbiaUniversity")).execute(this);
        
        pie1.addView(piechart1,new LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT));
        pie2.addView(piechart2,new LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT));
        pie3.addView(piechart3,new LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT));
        pie4.addView(piechart4,new LayoutParams(LayoutParams.MATCH_PARENT,LayoutParams.MATCH_PARENT));
    	
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
   	        
			String label;
			String data; 			
			
			String ispname = "";
			 
			// Extracting and calculating data
			for (int h = 0; h<n ; h++){
			 	Scanner sc = new Scanner(History[h]);  
			    sc.useDelimiter("&|=");
				while(sc.hasNext()){
					label = sc.next(); 
					data = sc.next();
					
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
