const TYPE_LABELS = {
  track: "Canción",
  artist: "Artista",
  album: "Álbum",
};

function getImage(item, type) {
  if (type === "track") return item.album?.images?.[0]?.url;
  return item.images?.[0]?.url;
}

function getSubtitle(item, type) {
  if (type === "artist") {
    return item.genres?.slice(0, 2).join(" · ") || "Perfil de artista";
  }
  return item.artists?.map((artist) => artist.name).join(", ") || "";
}

function getMetadata(item, type) {
  if (type === "album" && item.release_date) {
    return item.release_date.slice(0, 4);
  }
  if (typeof item.popularity === "number") {
    return `Popularidad ${item.popularity}/100`;
  }
  if (type === "track" && item.album?.name) return item.album.name;
  if (type === "album" && item.total_tracks) {
    return `${item.total_tracks} temas`;
  }
  return TYPE_LABELS[type];
}

export default function SpotifyCard({ item, type }) {
  const image = getImage(item, type);
  const title = item.name;
  const spotifyUrl = item.external_urls?.spotify;

  const content = (
    <>
      <div className={`media-card__art media-card__art--${type}`}>
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <span className="media-card__placeholder" aria-hidden="true">
            <i
              className={`bi ${
                type === "artist"
                  ? "bi-person-music"
                  : type === "track"
                    ? "bi-music-note"
                    : "bi-collection-play"
              }`}
            />
          </span>
        )}
        <span className="media-card__type">{TYPE_LABELS[type]}</span>
      </div>
      <div className="media-card__info">
        <h3>{title}</h3>
        <p className="media-card__subtitle">{getSubtitle(item, type)}</p>
        <p className="media-card__metadata">{getMetadata(item, type)}</p>
      </div>
      <span className="media-card__open">
        Abrir en Spotify <i className="bi bi-arrow-up-right" aria-hidden="true" />
      </span>
    </>
  );

  return (
    <article className={`media-card media-card--${type}`}>
      {spotifyUrl ? (
        <a
          className="media-card__link"
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Abrir ${TYPE_LABELS[type].toLowerCase()} ${title} en Spotify`}
        >
          {content}
        </a>
      ) : (
        <div className="media-card__link">{content}</div>
      )}
    </article>
  );
}
