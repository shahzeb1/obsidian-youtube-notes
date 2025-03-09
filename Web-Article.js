module.exports = {
    settings: {
      name: "Article Learning",
      author: "shahzeb <github.com/shahzeb1>",
      options: {
        folder: {
          type: "input",
          defaultValue: "Article Notes", // Default folder for article notes
        },
      },
    },
    entry: ArticleLinkFetcher,
  };
  
  async function ArticleLinkFetcher(ctx, settings) {
    // It's easier to use DataView plugin to get the number of files in the folder
    const dataview = ctx.app.plugins.plugins?.dataview?.api;
    if (!dataview) {
      throw new Error(
        "Please install the DataView plugin from the Community Plugins in Obsidian Settings."
      );
    }
  
    // Get the URL from the user
    const url = await ctx.quickAddApi.inputPrompt(
      "Enter Article URL",
      "https://example.com/article"
    );
    if (!url) return null;
  
    try {
      // Extract domain from URL
      let domain;
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
      } catch (e) {
        domain = "unknown-domain";
      }
      
      // Fetch the article page to get the title
      const response = await requestUrl(url);
      const html = response.text;
      
      // Extract title from HTML using regex
      const titleMatch = html.match(/<title(?:\s+[^>]*)?>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "Untitled Article";
  
      // Set the variables other macros or templates can use
      ctx.variables.url = url;
      ctx.variables.title = cleanFileName(title);
      ctx.variables.domain = domain;
      ctx.variables.folder = settings.folder;
  
      // Desired folder where notes will be created
      const targetFolder = settings.folder;
  
      try {
        // Create parent folder if it doesn't exist
        if (!app.vault.getAbstractFileByPath(settings.folder)) {
          await app.vault.createFolder(settings.folder);
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
      const numbers = pages
        .map((page) => {
          const match = page.file.name.match(/^(\d+)/);
          return match ? parseInt(match[1]) : 0;
        })
        .filter((num) => num > 0);
      const fileNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
      ctx.variables.fileNumber = fileNumber;
  
      return null;
    } catch (error) {
      throw new Error(`Failed to fetch article: ${error.message}`);
    }
  }
  
  // Function to clean the file name by replacing invalid characters
function cleanFileName(title) {
  // Define a regex to match invalid characters
  const invalidChars = /[\\/:*?"<>|]/g;

  // Replace invalid characters with a hyphen
  return title.replace(invalidChars, "-");
}
