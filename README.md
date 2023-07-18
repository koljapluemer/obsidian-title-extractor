# Obsidian Title Extractor

Tired of pasting your heading into your note's title? Tired of dealing with `Untitled307.md`?

This Obisidan plugin provides you with a command to automatically extract the beginning of your note and make it the file title.

## Settings

There are a bunch of settings which allow you to fine-tune how note titles are generated. If you are not sure what these are about, you can probably keep the default settings.

I split Settings into `Style` and `Compatibility`. The former influences the look and feel of your titles-- you may want to play around with them. The latter is less likely to matter to you. Compatibility settings mostly prevent issues and pain related to special characters in file names when you handle them in scripts, older operating systems or other special contexts.  

For most settings, you will find an example to clarify what happens if you toggle it. Please note that some examples also use other settings to make the effect clear. 


### Style Settings


#### Maximum length of title.

Defines the number of characters that are allowed in the title. The program tries to avoid cutting off words in the middle.

*example: you have set maximum length to **64** and have the following note:*

```
Ay, marry, is’t:  
But to my mind, though I am native here  
And to the manner born, it is a custom  
More honour’d in the breach than the observance.  
This heavy-headed revel east and west  
Makes us traduced and tax’d of other nations: 
```

*the plugin will generate the following title:* `Ay, marry, is’t_ But to my mind, though I am native here And to.md`

#### Exclude frontmatter

As you may know, Obsidian allows you to put metadata in the so-called frontmatter of your note. By default, frontmatter is excluded from the title. If you want to include it (for some reason), turn this setting off.

*example: you have the following note:*

```
---
interval: 1
repetition: 1
efactor: 2.6
dueAt: 2023-07-19T13:24:16.453Z
---
estremo

---

extreme, (the) utmost, (the) farthest, terminal, (the) outermost, drastic, excessive, intense
```

* *if you have set **exclude frontmatter** to **true** the plugin will generate the following title:* `-estremo --- extreme, (the) utmost, (the) farthest, terminal,.md`

* *if you have set **exclude frontmatter** to **false** the plugin will generate the following title:* `--- interval_ 1 repetition_ 1 efactor_ 2.6 dueAt_ 2023-07-19T13.md`




#### Consider only first line

Per default, the plugin will only use the first line of your note to generate the title. As a general rule, this creates quite beautiful filenames. If you disable this setting, the rest of the note will also be considered (until the character limit is hit)

*example: you have the following note:*

```
## [Tamara de Lempicka](https://en.wikipedia.org/wiki/Tamara_de_Lempicka)


> was a Polish painter who spent her working life in France and the United States. She is best known for her polished Art Deco portraits of aristocrats and the wealthy, and for her highly stylized paintings of nudes. 

```

* *if you have set **consider only first line** to **true** the plugin will generate the following title:* `Tamara de Lempicka.md`

* *if you have set **consider only first line** to **false** the plugin will generate the following title:* `Tamara de Lempicka was a Polish painter who spent her working.md`


#### Strip Markdown

[Markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) is the language you use in Obsidian to do stuff like making things **bold** or *italic*. You probably don't want Markdown commands like `* [ ] <` in your filename, but if so, disable this setting. 

*example: you have the following note:*

```
## [Hebbian Learning](https://en.wikipedia.org/wiki/Hebbian_theory)

> "Cells that fire together wire together." 

```

* *if you have set **strip markdown** to **true** the plugin will generate the following title:* `Hebbian Learning "Cells that fire together wire together.".md`

* *if you have set **strip markdown** to **false** the plugin will generate the following title:* `## [Hebbian Learning](https___en.wikipedia.org_wiki_Hebbian_theory) > "Cells that fire.md`

### Compatibility Settings

Activating any of these generally makes title uglier, but more compatible with old operating systems, scripts, bash commands and so on.

If you are not doing anything fancy with your Obsidian files, you can likely leave these alone.

#### Strip periods

Removes all `.`s (periods/full stops/dots/decimal points) from your titles. Activating this setting may be useful if you are using `.` to detect file types in a script.

#### Replace spaces with underscores

Some systems dislike spaces in filenames. If this is relevant to you, enable this setting.

*example:*

* *if you have set **Replace spaces with underscores** to **true** the plugin will generate titles like:* `Dangerous_Ideas__Getting_Started_is_Overrated.md`

* *if you have set **Replace spaces with underscores** to **false** the plugin will generate titles like:* `Dangerous Ideas_ Getting Started is Overrated`

*note: the `:` is always replaced, since colons are illegal in Obsidian filenames*

#### Strip all characters that are not letters, dashes or underscores

If your system can handle Unicode but you have trouble with special characters, you can enable this option.

I heavily recommend using this option together with **replace spaces with underscores** to create somewhat readable titles.

*example: you have the following note:*

```
## >10 Transliterations of Munich I ~~ love ~~ ;3

München / Muenchen / Muenchén, Múnich; Μόναχο, מינכן, ミュンヘン, 뮌헨, มิวนิก, ميونيخ, Мюнхен, 慕尼黑, 蒙典, მიუნხენი.
```

* *if you have set this option to **true** the plugin will generate the following title:* `10_Transliterations_of_Munich_I__love__3__München___Muenchen___Muenchén_Múnich_Μόναχο.md`

* *if you have set this option to **false** the plugin will generate the following title:* `>10_Transliterations_of_Munich_I__love__;3__München___Muenchen___Muenchén,_Múnich;.md`


#### Strip all characters that are not English letters, dashes or underscores

This option is meant as the ultimate catch-all compatibility option. Only allowing `_`, `-` and English characters should create filenames that not break anywhere. If they do anyways, please open an issue.

Note that enabling this will tend to create quite unreadable titles and just straight up removes characters like `ê` or `ü`.