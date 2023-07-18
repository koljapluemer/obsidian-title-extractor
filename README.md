# Obsidian Title Extractor

Tired of pasting your heading into your note's title? Tired of dealing with `Untitled307.md`?

This Obisidan plugin provides you with a command to automatically extract the beginning of your note and make it the file title.

## Settings

There are a bunch of settings which allow you to fine-tune how note titles are generated. If you are not sure what these are about, you can probably keep the default settings.

### Maximum length of title.

Defines the number of characters that are allowed in the title. The program tries to avoid cutting off words in the middle.

*example: you have set maximum length to **64** and have the following note*

```
Ay, marry, is’t:  
But to my mind, though I am native here  
And to the manner born, it is a custom  
More honour’d in the breach than the observance.  
This heavy-headed revel east and west  
Makes us traduced and tax’d of other nations: 
```

*generates:* `Ay, marry, is’t.md`