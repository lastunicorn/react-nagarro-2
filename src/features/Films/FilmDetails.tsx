import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Film } from './FilmTypes';

export function FilmDetails() {
  const [film, setFilm] = useState<Film | null>(null);
  const { id } = useParams();

  useEffect(() => {
    async function getFilm() {
      const data = await fetch(`http://localhost:3210/films/${id}`).then(
        (res) => res.json()
      );

      if (!data) {
        return null;
      }
      // const completeFilm = {...data};
      const externalResources = [
        'characters',
        'starships',
        'vehicles',
        'planets',
        'species',
      ] as const;
      const relatedEntities: Partial<
        Record<(typeof externalResources)[number], any>
      > = {};
      for (const resource of externalResources) {
        if (data[resource]) {
          const resourcePromises = [];
          for (const resId of data[resource]) {
            resourcePromises.push(
              fetch(`http://localhost:3210/${resource}/${resId}`).then((res) =>
                res.json()
              )
            );
          }
          relatedEntities[resource] = await Promise.all(resourcePromises);
        }
      }

      setFilm({...data, ...relatedEntities});
    }

    getFilm();
  }, [id]);

  if (!film) {
    return <strong>Loading ...</strong>;
  }

  const crawlParts = film.opening_crawl.split('\r\n');
  const jsxCrawl = crawlParts.map((part) => <p>{part}</p>);

  console.log(film);

  return (
    <>
      <h1>{film.title}</h1>
      <div>{jsxCrawl}</div>
      <h2>Characters</h2>
      <ul>
        {film.characters.map((ch) => (
          <li key={ch.id}>{ch.name}</li>
        ))}
      </ul>

      <h2>
        Starships
      </h2>
      <ul>
        {film.starships.map((ship) => (
          <li key={ship.id}>{ship.name}</li>
        ))}
      </ul>
      <Link to={`/films/${Number(id!) + 1}`}>Next</Link>
    </>
  );
}
