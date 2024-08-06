import { ActionFunction, LinksFunction, LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Links, Link, Outlet, Meta, Scripts, ScrollRestoration, useLoaderData, NavLink, useNavigation, useSubmit } from "@remix-run/react";
import appStylesHref from "./app.css?url";
// eslint-disable-next-line import/no-duplicates
import { createEmptyContact, getContacts } from "./data";
import { Key, useEffect } from "react";

// Loader function untuk mengambil data kontak
export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// Action function untuk membuat kontak baru
export const action: ActionFunction = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

// Definisikan fungsi links untuk memasukkan stylesheet
export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// Komponen utama aplikasi
export default function App() {
  // Ambil data kontak yang sudah dimuat
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta /> {/* Ini untuk metadata */}
        <Links /> {/* Ini akan merender <link> dari fungsi links */}
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form id="search-form" role="search" onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch,
                });
              }}
              >
              <input
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                defaultValue={q || ""}
                id="q"
                name="q"
                placeholder="Search"
                type="search"
              />
              <div aria-hidden hidden={!searching} id="search-spinner" />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {/* Tampilkan daftar kontak */}
            {contacts.length ? (
              <ul>
                {contacts.map((contact: {
                  first: never;
                  last: never;
                  favorite: never; id: Key | null | undefined; 
}) => (
                  <li key={contact.id}>
                    <NavLink
                  className={({ isActive, isPending }) =>
                    isActive
                      ? "active"
                      : isPending
                      ? "pending"
                      : ""
                  }
                  to={`contacts/${contact.id}`}
                >
                   {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? (
                        <span>★</span>
                      ) : null}
                  </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
            <ul>
              <li>
                <Link to={`/contacts/1`}>Your Name</Link>
              </li>
              <li>
                <Link to={`/contacts/2`}>Your Friend</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className={
            navigation.state === "loading" ? "loading" : ""
          } id="detail">
          <Outlet /> {/* Tempat untuk menampilkan detail kontak yang dipilih */}
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
