package com.testyoutube;
  
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;
import java.util.Set;

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
	private Map<String, int[]> map = new HashMap<String, int[]>();
	private int[] xlabel= {1,2,3,4,5,6,7,8,9,10,11,12};
	private int[] timelengthbymonth = new int[12];
	private int[] colorlist = new int[]{Color.MAGENTA, Color.RED, Color.CYAN, Color.GRAY, Color.GREEN, Color.BLUE};
	private PointStyle[] pointstylelist = new PointStyle[]{PointStyle.CIRCLE, PointStyle.DIAMOND, PointStyle.SQUARE, PointStyle.TRIANGLE, PointStyle.POINT};


	
	
	public LineChart(){
		  
	}
    
	public Intent execute(Context context){   
		
		readInfo(context);		
   
		XYMultipleSeriesRenderer multiRenderer = customizeMultipleRender();
		Set<String> keyset = map.keySet();
		String[] ISP = keyset.toArray(new String[keyset.size()]);
		
        // Adding data
        XYSeries[] SingleSeries = new XYSeries[ISP.length];
		for(int i = 0; i< ISP.length; i++){
			SingleSeries[i] = new XYSeries(ISP[i]);			 
		} 
        
        for(int i=0; i < xlabel.length; i++){
        	for(int j = 0; j < ISP.length; j++){
        		int[] data = map.get(ISP[j]);
        		if (timelengthbymonth[i] == 0){
        			SingleSeries[j].add(xlabel[i], 0);
        		}
        		else{
        			double d=(double)data[i]/(double)timelengthbymonth[i];
        			d=d*100.0*100.0;
        			d=(double)Math.ceil(d)/100;
        			SingleSeries[j].add(xlabel[i], d);
        		}
    		} 
        }
 
        XYMultipleSeriesDataset dataset = new XYMultipleSeriesDataset(); 
        
        for(int i = 0; i< ISP.length; i++){
        	// Creating a dataset for each series
        	dataset.addSeries(SingleSeries[i]);	
        	
        	// Building XYSeriesRenderer for each isp
        	XYSeriesRenderer renderer = buildXYSeriesRender(colorlist[i%colorlist.length], pointstylelist[i%pointstylelist.length]);
        	multiRenderer.addSeriesRenderer(renderer);
		} 
 
        Intent intent = ChartFactory.getLineChartIntent(context, dataset, multiRenderer,
        		" Avg. rebuffering ratio (%)");
        return intent;
    }
       
	protected XYMultipleSeriesRenderer customizeMultipleRender(){
		// Creating a XYMultipleSeriesRenderer to customize the whole chart
        XYMultipleSeriesRenderer renderer = new XYMultipleSeriesRenderer();
        renderer.setXLabels(0);  
        renderer.setBackgroundColor(Color.BLACK);
        renderer.setAxesColor(Color.WHITE);
        renderer.setGridColor(Color.WHITE);
        renderer.setShowGrid(true);
        renderer.setApplyBackgroundColor(true);
        renderer.setXTitle("Month");
        renderer.setYTitle("Avg. rebuffering ratio (%)");
        
        // Changing font size and point size
        renderer.setAxisTitleTextSize(26); 
        renderer.setLabelsTextSize(22);
        renderer.setLegendTextSize(26);
        renderer.setLegendHeight(80);
        renderer.setPointSize(8);
        
        // Setting margins: above, left, below, right
        renderer.setMargins(new int[] {0, 70, 100, 50});
        
        for(int i=0;i < xlabel.length;i++){
        	renderer.addXTextLabel(i+1, mMonth[i]);
        }
        return renderer;
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
            while((length=inStream.read(buffer))!=-1) {
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
			String ispname="";
			 
			int month = 0;
			int bufferformonth = 0;
			 
			// Extracting and calculating data
			for (int h=0; h<n; h++){
			 	Scanner sc = new Scanner(History[h]);  
			    sc.useDelimiter("&|=");
				while(sc.hasNext()){
					if(sc.hasNext()) label = sc.next(); 
					if(sc.hasNext()) data = sc.next();
					
//					Log.i("label",label);
//					Log.i("data",data);
					if(label.equals("localtime")){
						month = Integer.parseInt(data.substring(5,7))-1;
					}else if(label.equals("bufferduration")){
						bufferformonth = Integer.parseInt(data); 
					}else if(label.equals("timelength")){
						timelengthbymonth[month] += Integer.parseInt(data);
					}else if(label.equals("org")){
						ispname = data;
					}
					label="";
					data="";
			    }
			    sc.close();
			    
			    int[] bufferrecord;
			    if(map.get(ispname)==null){
			    	bufferrecord = new int[12];
			    }
			    else{
			    	bufferrecord = map.get(ispname);
			    }
			    bufferrecord[month] += bufferformonth;
			    map.put(ispname, bufferrecord);
		    }		
           
			map.remove("");
        } catch (FileNotFoundException e) {
            return;
        }
        catch (IOException e){
            return ;
        }
	}	
}
