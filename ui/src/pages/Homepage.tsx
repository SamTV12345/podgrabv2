import {useEffect, useState} from "react";
import axios, {AxiosResponse} from "axios";
import {apiURL} from "../utils/Utilities";
import {PodcastWatchedEpisodeModel} from "../models/PodcastWatchedEpisodeModel";
import {PlayIcon} from "../components/PlayIcon";
import {PodcastWatchedModel} from "../models/PodcastWatchedModel";
import {store} from "../store/store";
import {setCurrentPodcast, setCurrentPodcastEpisode} from "../store/AudioPlayerSlice";
import {useAppDispatch} from "../store/hooks";

export const Homepage = () => {
    const [podcastWatched, setPodcastWatched] = useState<PodcastWatchedEpisodeModel[]>([])
    const dispatch = useAppDispatch()

    useEffect(()=>{
        axios.get(apiURL+"/podcast/episode/lastwatched")
            .then((v:AxiosResponse<PodcastWatchedEpisodeModel[]>)=>{
                setPodcastWatched(v.data)
            })
    },[])

    return <div className="p-3">
        <h1 className="font-bold text-2xl">Zuletzt gehört</h1>
        <div className="grid grid-cols-2 md:grid-cols-5 xs:grid-cols-1 gap-4">
        {
            podcastWatched.map((v)=>{
                return <div key={v.episodeId}
                    className="max-w-sm rounded-lg shadow bg-gray-800 border-gray-700">
                    <div className="relative" key={v.episodeId}>
                        <img src={v.podcastEpisode.local_image_url} alt="" className=""/>
                        <div className="absolute left-0 top-0 w-full h-full hover:bg-gray-500 opacity-80 z-10 grid place-items-center play-button-background">
                            <PlayIcon key={v.podcastEpisode.episode_id+"icon"} podcast={v.podcastEpisode} className="w-20 h-20 opacity-0" onClick={()=>{
                                axios.get(apiURL+"/podcast/episode/"+v.podcastEpisode.episode_id)
                                    .then((response: AxiosResponse<PodcastWatchedModel>)=>{
                                        store.dispatch(setCurrentPodcastEpisode({
                                            ...v.podcastEpisode,
                                            time: response.data.watchedTime
                                        }))
                                        console.log(response.data.watchedTime)
                                        dispatch(setCurrentPodcast(v.podcast))
                                    })
                            }}/>
                        </div>
                    </div>
                    <div className="relative border-box w-11/12">
                        <div className="bg-blue-900 h-2" style={{width: (v.watchedTime/v.totalTime)*100+"%"}}></div>
                    </div>
                    <div className="p-5">
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white break-words">{v.name}</h5>
                    </div>
                </div>
            })
        }
        </div>
    </div>
}
