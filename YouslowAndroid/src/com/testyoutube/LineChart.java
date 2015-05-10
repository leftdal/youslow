package com.testyoutube;
  
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Scanner;

import org.achartengine.ChartFactory;
import org.achartengine.chart.PointStyle;
import org.achartengine.model.XYMultipleSeriesDataset;
import org.achartengine.model.XYSeries;  
import org.achartengine.renderer.XYMultipleSeriesRenderer;
import org.achartengine.renderer.XYSeriesRenderer;
 
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;  
 

public class LineChart {
	private String[] mMonth = new String[] {
	        "Jan", "Feb" , "Mar", "Apr", "May", "Jun",
	        "Jul", "Aug" , "Sep", "Oct", "Nov", "Dec"
	};
	
	// For each ISP we need different double arrays
	private String[] ISP = new String[]{"4G: Verizon", "WiFi: Comcast", "WiFi: Columbia", "WiFi: Verizon"};
	private double[] fourg = new double[12];
	private double[] wifiCom = new double[12];
	private double[] wifiColu = new double[12];
	private double[] wifiVer = new double[12];
	private int[] xlabel= {1,2,3,4,5,6,7,8,9,10,11,12};
	
	public LineChart(){
		  
	}
    
	public Intent execute(Context context){   
		
		readInfo(context);		
  
		XYSeries[] SingleSeries = new XYSeries[ISP.length];
		for(int i = 0; i< ISP.length; i++){
			SingleSeries[i] = new XYSeries(ISP[i]);			 
		} 
        
        // Adding data to Series
        for(int i=0;i < xlabel.length;i++){
        	SingleSeries[0].add(xlabel[i], fourg[i]);
        	SingleSeries[1].add(xlabel[i],wifiCom[i]);
        	SingleSeries[2].add(xlabel[i],wifiColu[i]);
        	SingleSeries[3].add(xlabel[i],wifiVer[i]);
        }
 
        // Creating a dataset to hold each series
        XYMultipleSeriesDataset dataset = new XYMultipleSeriesDataset(); 
        
        for(int i = 0; i< ISP.length; i++){
        	dataset.addSeries(SingleSeries[i]);			 
		} 
           
        // Building XYSeriesRenderer for each isp
        XYSeriesRenderer fourGRenderer = buildXYSeriesRender(Color.RED, PointStyle.CIRCLE);   
        XYSeriesRenderer wifiComRenderer = buildXYSeriesRender(Color.BLUE, PointStyle.DIAMOND); 
        XYSeriesRenderer wifiColuRenderer = buildXYSeriesRender(Color.CYAN, PointStyle.SQUARE); 
        XYSeriesRenderer wifiVerRenderer = buildXYSeriesRender(Color.MAGENTA, PointStyle.TRIANGLE); 
 
        // Creating a XYMultipleSeriesRenderer to customize the whole chart
        XYMultipleSeriesRenderer multiRenderer = new XYMultipleSeriesRenderer();
        multiRenderer.setXLabels(0);  
        multiRenderer.setBackgroundColor(Color.BLACK);
        multiRenderer.setAxesColor(Color.WHITE);
        multiRenderer.setGridColor(Color.WHITE);
        multiRenderer.setShowGrid(true);
        multiRenderer.setApplyBackgroundColor(true);
        multiRenderer.setXTitle("MONTH");
        multiRenderer.setYTitle("AVERAGE REBUFFERING RATIO(%)");
        
        // Changing font size and point size
        multiRenderer.setAxisTitleTextSize(26); 
        multiRenderer.setLabelsTextSize(22);
        multiRenderer.setLegendTextSize(26);
        multiRenderer.setLegendHeight(80);
        multiRenderer.setPointSize(8);
        
        // Setting margins: above, left, below, right
        multiRenderer.setMargins(new int[] {0, 50, 150, 20});
        
        for(int i=0;i < xlabel.length;i++){
            multiRenderer.addXTextLabel(i+1, mMonth[i]);
        }

        multiRenderer.addSeriesRenderer(fourGRenderer);
        multiRenderer.addSeriesRenderer(wifiComRenderer);
        multiRenderer.addSeriesRenderer(wifiColuRenderer);
        multiRenderer.addSeriesRenderer(wifiVerRenderer);
 
        Intent intent = ChartFactory.getLineChartIntent(context, dataset, multiRenderer,
        		"Average rebuffering ratio(%)");
        return intent;
    }
       
	protected XYSeriesRenderer buildXYSeriesRender(int color, PointStyle style){
		XYSeriesRenderer renderer = new XYSeriesRenderer();
		renderer.setColor(color);
		renderer.setPointStyle(style); 
		renderer.setFillPoints(true);
		renderer.setDisplayChartValues(true);
		
		//Chaning size in graph
		renderer.setLineWidth(3);
		renderer.setChartValuesTextSize(25.0f);
		
		return renderer;
	}     
    
	// Getting information from data we stored
	private void readInfo(Context context){

		String[] History = new String[20];
		int n = 0; // Count number of records
        try {
     	    FileInputStream inStream = context.openFileInput("recentrecords.txt");
            ByteArrayOutputStream stream=new ByteArrayOutputStream();
            byte[] buffer=new byte[1024];
            int length = -1;
            while((length=inStream.read(buffer))!=-1)   {
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
			String ispname="";
			 
			int[] bufferbymonth = new int[12];
			int[] timelengthbymonth = new int[12];
			int month = 0;
			 
			// Extracting and calculating data
			for (int h=0; h<n; h++){
			 	Scanner sc = new Scanner(History[h]);  
			    sc.useDelimiter("&|=");
				while(sc.hasNext()){
					label = sc.next(); 
					data = sc.next();
					
					if(label.equals("localtime")){
						month = Integer.parseInt(data.substring(5,7))-1;
					}
					else if(label.equals("bufferduration")){
						bufferbymonth[month] += Integer.parseInt(data); 
					}
					else if(label.equals("timelength")){
						timelengthbymonth[month] += Integer.parseInt(data);
					}
					else if(label.equals("org")){
						ispname = data;
					}
			    }
			    sc.close();
			    
			    // The ispname may not be correct. 
			    if(ispname.equals("verizon")){
			    	// Adding data to verizon array
			    	for(int i = 0; i < 12; i++){
			    		if(timelengthbymonth[i]==0){
			    			wifiVer[i]+=0;
			    		}
			    		else{
			    			wifiVer[i] = (double)bufferbymonth[i]/timelengthbymonth[i];
			    		}
			    	}
			    }
			    else if(ispname.equals("AS14ColumbiaUniversity")){
			    	// Adding data to columbia array
			    	for(int i = 0; i <12; i++){
			    		if(timelengthbymonth[i]==0){
			    			wifiColu[i]+=0;
			    		}
			    		else{
			    			wifiColu[i] = (double)bufferbymonth[i]/timelengthbymonth[i];
			    		}
			    	}
			    }
			    else if(ispname.equals("Comcast")){
			    	// Adding data to comcast array
			    	for(int i = 0; i <12; i++){
			    		if(timelengthbymonth[i]==0){
			    			wifiCom[i]+=0;
			    		}
			    		else{
			    			wifiCom[i] = (double)bufferbymonth[i]/timelengthbymonth[i];
			    		}
			    	}
			    }
			    else if(ispname.equals("AT&T")){
			    	// Adding data to 4g array
			    	for(int i = 0; i <12; i++){
			    		if(timelengthbymonth[i]==0){
			    			fourg[i]+=0;
			    		}
			    		else{
			    			fourg[i] = (double)bufferbymonth[i]/timelengthbymonth[i];
			    		}
			    	}
			    }
		    }		
             
        } catch (FileNotFoundException e) {
            return;
        }
        catch (IOException e){
            return ;
        }
	}	
}
