use std::io::Write;
use std::path::Path;
use reqwest::{ClientBuilder};
use crate::db::DB;
use crate::service::podcast_episode_service::PodcastEpisodeService;

pub struct FileService {}

impl FileService {

        pub fn check_if_podcast_main_image_downloaded(podcast_id: &str) -> bool {
            let db = DB::new().unwrap();
            let podcast = db.get_podcast_by_directory(podcast_id).unwrap();
            match podcast {
                Some(podcast) => {
                    if !podcast.image_url.contains("http") {
                        return Path::new(&podcast.image_url).exists()
                    }
                }
                None => {
                    return false;
                }
            }
            return false;
        }

        pub fn create_podcast_root_directory_exists(){
            if !Path::new("podcasts").exists() {
                std::fs::create_dir("podcasts").expect("Error creating directory");
            }
        }

        pub fn create_podcast_directory_exists(podcast_id: &str){
            if !Path::new(&format!("podcasts/{}",podcast_id)).exists() {
                std::fs::create_dir(&format!("podcasts/{}",podcast_id))
                    .expect("Error creating directory");
            }
        }

        pub async fn download_podcast_image(podcast_id: &str, image_url: &str){
            let client = ClientBuilder::new().build().unwrap();
            let image_response = client.get(image_url).send().await.unwrap();
            let image_suffix = PodcastEpisodeService::get_url_file_suffix(image_url);
            let file_path = format!("podcasts/{}/image.{}", podcast_id, image_suffix);
            let mut image_out = std::fs::File::create(file_path.clone())
                .unwrap();
            let bytes  =image_response.bytes().await.unwrap();
            image_out.write_all(&bytes).unwrap();
            let db = DB::new().unwrap();
            println!("Before update: {}", file_path);
            db.update_podcast_image(podcast_id, &file_path).unwrap();
        }
}
