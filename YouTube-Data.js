module.exports = {
  settings: {
    name: "Youtube Learning",
    author: "shahzeb <github.com/shahzeb1>",
    options: {
      folder: {
        type: "input",
        defaultValue: "Video Learnings", // Default folder for YouTube notes
      },
      key: {
        type: "input",
        defaultValue: "", // Google API Key
      },
    },
  },
  entry: YoutubeLearning,
};

async function YoutubeLearning(ctx, settings) {
  // It's easier to use DataView plugin to get the number of files in the folder
  const dataview = ctx.app.plugins.plugins?.dataview?.api;
  if (!dataview) {
    throw new Error(
      "Please install the DataView plugin from the Community Plugins in Obsidian Settings."
    );
  }

  // Get the URL from the user
  const url = await ctx.quickAddApi.inputPrompt(
    "Enter YouTube URL",
    "https://www.youtube.com/watch?v=TTCN2hzhxcI"
  );
  if (!url) return null;

  // Extract the video ID from the URL
  const videoId = new URL(url).searchParams.get("v");
  if (!videoId) {
    throw new Error(
      "Could not extract video ID from URL. Please ensure this is a valid YouTube video URL."
    );
  }

  // Fetch the video data from the YouTube API
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${settings.key}`
  );
  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error(
      "No video data found. Please ensure this is a valid YouTube video URL."
    );
  }

   // Clean the title to remove invalid characters
    const cleanTitle = cleanFileName(data.items[0].snippet.title);

  // Set the variables other macros or templates can use
  // by doing {{value:url}} or {{value:title}} etc.
  ctx.variables.url = url;
  ctx.variables.title = cleanTitle;
  ctx.variables.channel = data.items[0].snippet.channelTitle;
  ctx.variables.folder = settings.folder;

  // Desired folder where notes will be created
  const targetFolder = `${settings.folder}/${ctx.variables.channel}`;

  try {
    // Create parent folder if it doesn't exist
    if (!app.vault.getAbstractFileByPath(settings.folder)) {
      await app.vault.createFolder(settings.folder);
    }

    // Create channel folder if it doesn't exist
    if (!app.vault.getAbstractFileByPath(targetFolder)) {
      await app.vault.createFolder(targetFolder);
    }

    // Set initial file number
    ctx.variables.fileNumber = 1;
  } catch (error) {
    // Ignore folder exists error and continue
    if (!error.message.includes("Folder already exists")) {
      throw error;
    }
  }

  // Using DataView to get the number of files in the folder
  const query = '"' + targetFolder + '"';
  const pages = dataview.pages(query).values;

  // Get the highest number from existing files that start with numbers
  // This will skip any files that don't start with a number
  const numbers = pages
    .map((page) => {
      const match = page.file.name.match(/^(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter((num) => num > 0);
  const fileNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  ctx.variables.fileNumber = fileNumber;

  return null;
}

// Function to clean the file name by replacing invalid characters
function cleanFileName(title) {
  // Define a regex to match invalid characters
  const invalidChars = /[\\/:*?"<>|]/g;

  // Replace invalid characters with a hyphen
  return title.replace(invalidChars, "-");
}
