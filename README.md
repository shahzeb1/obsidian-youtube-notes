# o Obsidian scripts for QuickAdd

1. A YouTube notes script
2. A general web article wcript

## Requires Obsidian Extensions:

1. Dataview
2. QuickAdd

## Set up YouTube Script:

1. Get a YouTube API key via Google Cloud [tut](https://docs.themeum.com/tutor-lms/tutorials/get-youtube-api-key/)
2. Add the key to the macro via the settings gear icon
3. Invoke the macro and then use the following values in your template:
- `{{value:folder}}` - Root level folder of all the video notes (access via macro settings gear)
- `{{value:url}}` - Video URL
- `{{value:title}}` - Video title
- `{{value:channel}}` - Video creator
- `{{value:fileNumber}}` - Counts and increments the number of files already in the target folder

## Contrib:

The code is so dead simple that you can use it as a starting point for writing custom macros for QuickAdd.
MIT.
