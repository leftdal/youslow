package com.testyoutube;

import java.text.NumberFormat;

import org.achartengine.ChartFactory;
import org.achartengine.GraphicalView;
import org.achartengine.model.CategorySeries;
import org.achartengine.renderer.DefaultRenderer;
import org.achartengine.renderer.SimpleSeriesRenderer;

import android.content.Context;
import android.graphics.Color;
 
public class PieChart {  
     
     private String[] Playbackquality = new String[]{"small", "medium", "large", "hd720", "hd1080", "highres"};
     private double[] value = new double[Playbackquality.length]; 
     private String chartTitle;
     
     public PieChart(){
    	 chartTitle = "";
         value[0]=10;
         value[1]=15;
         value[2]=30;
         value[3]=20;
         value[4]=20;
         value[5]=5;
     }      
     
     public PieChart(String ChartTitle, double[] values){
    	 chartTitle = ChartTitle;
         value = values;
     }      
     
     public GraphicalView execute(Context context){ 
	
		int[] colors = new int[]{Color.GREEN, Color.LTGRAY, Color.BLUE, Color.RED, Color.DKGRAY, Color.MAGENTA}; 
		DefaultRenderer renderer = buildCategoryRenderer(colors); 
		CategorySeries categorySeries = new CategorySeries("Resolution Ratio Chart");
		
		// Calculating normalization coefficient
		double valueSum = 0;
		for(int i = 0;i < value.length;i++){
			valueSum += value[i];
		}
		
		// Adding data to Series
		for(int i = 0;i < Playbackquality.length;i++){
			categorySeries.add(Playbackquality[i], value[i]/valueSum); 
		}
		
		return ChartFactory.getPieChartView(context, categorySeries, renderer);          
	} 
     
    // Building DefaultRenderer to customize the whole chart
	protected DefaultRenderer buildCategoryRenderer(int[] colors){ 
	     DefaultRenderer renderer = new DefaultRenderer();
	     renderer.setBackgroundColor(Color.BLACK);
	     renderer.setApplyBackgroundColor(true);
	     renderer.setLabelsColor(Color.WHITE);
	     renderer.setDisplayValues(true);
	     renderer.setPanEnabled(false);
	     renderer.setZoomEnabled(false);
	     renderer.setInScroll(true);
	     renderer.setChartTitle(chartTitle);
	     
	     // Changing font size
	     renderer.setLabelsTextSize(26);
	     renderer.setLegendTextSize(26);
	     renderer.setLegendHeight(50);
	     renderer.setChartTitleTextSize(28);
	     
	     for (int color : colors) { 
	         SimpleSeriesRenderer r = new SimpleSeriesRenderer(); 
	         r.setColor(color); 
	         r.setChartValuesFormat(NumberFormat.getPercentInstance());             
	         renderer.addSeriesRenderer(r); 
	     }    
	     
	     return renderer; 
	 } 
	

 }