package com.testyoutube;
  
import java.io.ByteArrayOutputStream;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;
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
import android.util.Log;


/**
 * 
 * @author hyunwoonam
 * We collect all views
 */

public class LineChartLast10 {
	// For each ISP we need different double arrays
	private Map<String, ArrayList<String>> map = new HashMap<String, ArrayList<String>>();
	private int xlabelCount= 0;
	private int[] colorlist = new int[]{Color.MAGENTA, Color.RED, Color.CYAN, Color.GRAY, Color.GREEN, Color.BLUE};
	private PointStyle[] pointstylelist = new PointStyle[]{PointStyle.CIRCLE, PointStyle.DIAMOND, PointStyle.SQUARE, PointStyle.TRIANGLE, PointStyle.POINT};

	private int threshold=1000;
	
	

	public LineChartLast10(){
		  
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
		
		for(int i = 0; i< ISP.length; i++){
			ArrayList<String> data = map.get(ISP[i]);
			
			Log.i("dataSize: ",Integer.toString(data.size()));
			if(data.size()>xlabelCount) xlabelCount=data.size();
			Log.i("xlabelCountT: ",Integer.toString(xlabelCount));
			
			for(int j=0;j<data.size();j++){
				String str=data.get(j);
				String[] str_split=str.split("&");
				String str_date=str_split[0];
				String str_rb_ratio=str_split[1];
				SingleSeries[i].add(j, Double.parseDouble(str_rb_ratio));
				
				/**
				 * Add annotation for date
				 */
				SingleSeries[i].addAnnotation(str_date,j,Double.parseDouble(str_rb_ratio)+0.8);
			}
			
		}
		
		/**
		 * Update x labels
		 */
        for(int i=0;i<xlabelCount;i++){
        	multiRenderer.addXTextLabel(i, Integer.toString(i+1));
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
        		" Rebuffering ratio (%) per session");
        return intent;
    }
       
	protected XYMultipleSeriesRenderer customizeMultipleRender(){
		// Creating a XYMultipleSeriesRenderer to customize the whole chart
		XYMultipleSeriesRenderer rendererT = new XYMultipleSeriesRenderer();
        rendererT.setXLabels(0);  
        rendererT.setBackgroundColor(Color.BLACK);
        rendererT.setAxesColor(Color.WHITE);
        rendererT.setGridColor(Color.WHITE);
        rendererT.setShowGrid(true);
        rendererT.setApplyBackgroundColor(true);
        rendererT.setXTitle("Index");
        rendererT.setYTitle("Rebuffering ratio (%)");
        
        // Changing font size and point size
        rendererT.setAxisTitleTextSize(26); 
        rendererT.setLabelsTextSize(22);
        rendererT.setLegendTextSize(26);
        rendererT.setLegendHeight(80);
        rendererT.setPointSize(8);

        // Setting margins: above, left, below, right
        rendererT.setMargins(new int[] {0, 70, 100, 50});
        
        return rendererT;
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
		renderer.setAnnotationsTextSize(20.0f);
		
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
			 
			String time = "";
			int bufDuration = 0;
			int playbacktime = 0;
			
			// keep latest threshold
			int start=0;
			if(n>threshold) start=n-threshold;
			 
			// Extracting and calculating data
			for (int h=start; h<n; h++){
			 	Scanner sc = new Scanner(History[h]);  
			    sc.useDelimiter("&|=");
				while(sc.hasNext()){
					if(sc.hasNext()) label = sc.next(); 
					if(sc.hasNext()) data = sc.next();
					
//					Log.i("label",label);
//					Log.i("data",data);
					if(label.equals("localtime")){
						time = data;
						time=time.replace("-", "/");
						time=time.replace("%20", " ");
						time.substring(0,time.length()-3);
					}else if(label.equals("bufferduration")){
						bufDuration = Integer.parseInt(data); 
					}else if(label.equals("timelength")){
						playbacktime = Integer.parseInt(data);
					}else if(label.equals("org")){
						ispname = data;
					}
					label="";
					data="";
			    }
			    sc.close();
			    
			    ArrayList<String> bufferrecord=null;
			    if(map.get(ispname)==null){
			    	bufferrecord = new ArrayList<String>();
			    }else{
			    	bufferrecord = map.get(ispname);
			    }
			    double d=0;
			    String r=time+"&";
			    if(playbacktime!=0){
			    	d=(double)bufDuration/(double)playbacktime;
			    	d=(double)Math.ceil(d*100.0*100.0);
			    	d=(double)d/100.0;
			    	r=r+Double.toString(d);
			    }else{
			    	r=r+"0";
			    }
			    bufferrecord.add(r);
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
