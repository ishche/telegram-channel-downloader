type Downloadable = {
  webpage: boolean;
  poll: boolean;
  geo: boolean;
  contact: boolean;
  venue: boolean;
  sticker: boolean;
  image: boolean;
  video: boolean;
  audio: boolean;
  pdf: boolean;
};

type LastSelection = Object;

type CommandDesc = {
    signature: string,
    description: string,
    handle: (opt: Object) => Promise<void>,
    help: string,
};
