interface Music {
  fullLength: number;
  songs: Song[];
}

interface Song {
  songName: string;
  singer: string;
  length: number;
}

export type { Music, Song };
