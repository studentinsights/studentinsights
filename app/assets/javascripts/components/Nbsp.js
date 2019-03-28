import React from 'react';

// non-breaking space, https://stackoverflow.com/a/24437562/5711971
export default function Nbsp() {
  return <span>{"\u00A0"}</span>;
}