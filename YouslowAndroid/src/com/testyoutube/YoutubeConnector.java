package com.testyoutube;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import android.content.Context;
import com.google.api.client.http.HttpRequest;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import com.google.api.services.youtube.YouTube;
import com.google.api.services.youtube.model.SearchListResponse;
import com.google.api.services.youtube.model.SearchResult;

public class YoutubeConnector {
    private YouTube.Search.List query;
    private YouTube youtube; 
     
    // Developer key
    public static final String KEY = "AIzaSyBx8NE1C1VFreZgI4CP4tf2EeTx6TbHtDM";
     
    public YoutubeConnector(Context context) { 
        youtube = new YouTube.Builder(new NetHttpTransport(), 
                new JacksonFactory(), new HttpRequestInitializer() {            
            @Override
            public void initialize(HttpRequest hr) throws IOException {}
        }).setApplicationName(context.getString(R.string.app_name)).build();
         
        try{
        	// Setting search query
            query = youtube.search().list("id,snippet");
            query.setKey(KEY);          
            query.setType("video");
            query.setFields("items(id/videoId,snippet/title,snippet/description,snippet/thumbnails/default/url)");                              
        }catch(IOException e){
        	query = null;
        }
    }
	
	public List<VideoItem> search(String keywords){
	    
	    // Setting number of search results
	    query.setMaxResults((long) 25);
	    query.setQ(keywords);     
	    
	    try{
	        SearchListResponse response = query.execute();
	        List<SearchResult> results = response.getItems();	         
	        List<VideoItem> items = new ArrayList<VideoItem>();
	        
	        // Putting video information to items
	        for(SearchResult result:results){
	            VideoItem item = new VideoItem();
	            item.setId(result.getId().getVideoId());
	            item.setTitle(result.getSnippet().getTitle());
	            item.setDescription(result.getSnippet().getDescription());
	            item.setThumbnailURL(result.getSnippet().getThumbnails().getDefault().getUrl());
	            
	            items.add(item);            
	        }
	        
	        return items;
	        
	    }catch(IOException e){
	        return null;
	    }       
	}

}