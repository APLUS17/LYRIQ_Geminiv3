
export interface Lyric {
  id: string;
  html: string;
}

export interface Section {
  id: string;
  title: string;
  lyrics: Lyric[];
}

export interface Song {
  sections: Section[];
}