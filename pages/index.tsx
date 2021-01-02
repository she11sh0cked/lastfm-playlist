import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  FormControl,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import { useRouter } from "next/router";

export default function Home(): JSX.Element {
  const [form, setForm] = useState({
    user: "",
    type: "mix",
  });

  const [playlist, setPlaylist] = useState([]);

  const router = useRouter();
  const { user, type } = router.query as typeof form;

  useEffect(() => {
    if (!user || !type) return;

    fetch(`/api/playlist/${user}/${type}`)
      .then((res) => res.json())
      .then(setPlaylist);

    setForm({ user, type });
  }, [type, user]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  }, []);

  const handleFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      router.push(`/${form.user}/${form.type}`);
    },
    [form, router]
  );

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
                  secondary={song.artists.map((artist) => artist.name).join()}
                />
              </ListItem>
            ))}
          </List>
          <form autoComplete="off">
            <TextField
              name="name"
              type="text"
              label="Playlist Name"
              placeholder={`${user}'s ${type}`}
            />
            <Button variant="contained" color="primary" type="submit">
              Save
            </Button>
          </form>
        </>
      )}
    </>
  );
}
