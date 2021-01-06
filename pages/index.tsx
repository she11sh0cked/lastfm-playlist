import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { useRouter } from "next/router";

interface ISong {
  name: string;
  artists: string[];
  urls: Record<string, string>;
}

type TPlaylist = ISong[];

type TType = "mix" | "library" | "recommended";

interface IForm {
  user: string;
  type: TType;
}

function usePlaylist(
  user?: string,
  type?: TType
): [TPlaylist, { loading: boolean; refetch(): void }] {
  const [data, setData] = useState<TPlaylist>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    fetch(`/api/playlist/${user}/${type}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, [user, type]);

  useEffect(() => {
    if (user == null || type == null) return;
    refetch();
  }, [user, type, refetch]);

  return [data, { loading, refetch }];
}

function useForm(
  user?: string,
  type?: TType
): [
  IForm,
  {
    set<TKey extends keyof IForm>(
      name: TKey | string,
      value: IForm[TKey]
    ): void;
  }
] {
  const [data, setData] = useState<IForm>({ user: "", type: "mix" });

  const set = useCallback((key, value) => {
    setData((prevForm) => ({
      ...prevForm,
      [key]: value,
    }));
  }, []);

  useEffect(() => {
    if (user == null || type == null) return;
    setData({ user, type });
  }, [user, type]);

  return [data, { set }];
}

export default function Home(): JSX.Element {
  //* Router

  const router = useRouter();
  const { user, type } = (router.query as unknown) as IForm;

  //* Playlist

  const [playlist, playlistResult] = usePlaylist(user, type);
  const [playlistName, setPlaylistName] = useState("");

  const handlePlaylistNameChange = useCallback((e) => {
    const { value } = e.target;
    setPlaylistName(value);
  }, []);

  //* Form

  const [form, formActions] = useForm(user, type);

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<{ name: string; value: string }>) => {
      const { name, value } = e.target;
      formActions.set(name, value);
    },
    [formActions]
  );

  const handleFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      const pathname = `/${form.user}/${form.type}`;

      if (pathname === router.asPath) playlistResult.refetch();
      else router.push(pathname);
    },
    [form.type, form.user, playlistResult, router]
  );

  //* Render

  return (
    <>
      <form autoComplete="off" onSubmit={handleFormSubmit}>
        <TextField
          name="user"
          type="text"
          label="LastFM User"
          required
          value={form.user}
          onChange={handleFormChange}
        />
        <FormControl>
          <Select name="type" value={form.type} onChange={handleFormChange}>
            <MenuItem value="mix">Mix</MenuItem>
            <MenuItem value="library">Library</MenuItem>
            <MenuItem value="recommended">Recommended</MenuItem>
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit">
          Generate
        </Button>
      </form>
      {playlistResult.loading && <CircularProgress />}
      {playlist.length > 0 && (
        <>
          <List>
            {playlist.map((song, i) => (
              <ListItem key={i}>
                <ListItemText
                  primary={song.name}
                  secondary={song.artists.join(", ")}
                />
                <ListItemSecondaryAction>
                  {Object.keys(song.urls).map((urlKey) => (
                    <Button
                      key={urlKey}
                      href={song.urls[urlKey]}
                      target="_blank"
                    >
                      {urlKey}
                    </Button>
                  ))}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <form autoComplete="off">
            <TextField
              type="text"
              label="Playlist Name"
              placeholder={`${user}'s ${type}`}
              value={playlistName}
              onChange={handlePlaylistNameChange}
              disabled
            />
            <Button disabled variant="contained" color="primary" type="submit">
              Save
            </Button>
          </form>
        </>
      )}
    </>
  );
}
