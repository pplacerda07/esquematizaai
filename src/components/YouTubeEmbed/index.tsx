'use client';

import { useState } from 'react';
import styles from './styles.module.css';
import { YOUTUBE_ID, YOUTUBE_START } from '@/config';

type Props = {
  id?: string;
  start?: number;
  title?: string;
  badge?: string;
  alt?: string;
};

export default function YouTubeEmbed({
  id = YOUTUBE_ID,
  start = YOUTUBE_START,
  title = 'Esquematiza Mentoria — vídeo de apresentação',
  badge = 'Assista ao vídeo',
  alt = 'Vídeo de apresentação da Esquematiza',
}: Props) {
  const [play, setPlay] = useState(false);

  const src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&start=${start}&rel=0&modestbranding=1`;

  return (
    <div className={styles.wrap}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.frame}>
        {play ? (
          <iframe
            className={styles.iframe}
            src={src}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            className={styles.facade}
            onClick={() => setPlay(true)}
            aria-label={badge}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={styles.thumb}
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt={alt}
              onError={(e) => {
                e.currentTarget.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
              }}
            />
            <span className={styles.play}>▶</span>
            <span className={styles.badge}>▶ {badge}</span>
          </button>
        )}
      </div>
    </div>
  );
}
