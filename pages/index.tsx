import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
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

//* Playlist

interface ISong {
  name: string;
  artists: string[];
  urls: Record<string, string>;
}

type TPlaylist = ISong[];

//* Form

type TType = "mix" | "library" | "recommended";

interface IForm {
  user: string;
  type: TType;
}

export default function Home(): JSX.Element {
  //* Router

  const router = useRouter();
  const { user, type } = (router.query as unknown) as IForm;
  const isQueryOk = useMemo(() => user && type, [type, user]);

  //* Playlist

  const [playlist, setPlaylist] = useState<TPlaylist>([]);
  const [playlistName, setPlaylistName] = useState("");

  const handlePlaylistChange = useCallback(
    (user, type) =>
      fetch(`/api/playlist/${user}/${type}`)
        .then((res) => res.json())
        .then(setPlaylist),
    []
  );

  const handlePlaylistNameChange = useCallback((e) => {
    const { value } = e.target;
    setPlaylistName(value);
  }, []);

  //* Form

  const [form, setForm] = useState<IForm>({
    user: "",
    type: "mix",
  });

  const handleFormChange = useCallback(
    (e: React.ChangeEvent<{ name: string; value: string }>) => {
      const { name, value } = e.target;

      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
      }));
    },
    []
  );

  const handleFormSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();

      const pathname = `/${form.user}/${form.type}`;

      if (pathname === router.asPath)
        handlePlaylistChange(form.user, form.type);
      else router.push(pathname);
    },
    [form.type, form.user, handlePlaylistChange, router]
  );

  //! Effects

  useEffect(() => {
    if (!isQueryOk) return;
    handlePlaylistChange(user, type);
    setForm({ user, type });
  }, [handlePlaylistChange, isQueryOk, type, user]);

  //! Render

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
