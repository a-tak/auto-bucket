# AutoBucket

![](https://github.com/a-tak/auto-bucket/raw/master/docs/github-open-graph.png)

## What is AutoBucket

A Thunderbird extension that automatically sorts emails into several buckets (tags) using a Bayesian filter.

## Basic usage

1. Add a classification tag to Thunderbird and restart Thunderbird
2. Select the tag used for classification from the add-on settings and restart Thunderbird
![](https://github.com/a-tak/auto-bucket/raw/master/docs/initial-setting1.jpg)
![](https://github.com/a-tak/auto-bucket/raw/master/docs/initial-setting2.jpg)
3. Let's learn which tag to assign from AutoBucket in the menu displayed by right-clicking the email
4. After classifying some, right click or shortcut to judge mail. AutoBucket automatically classifies and tags according to the learning content.
5. If you find a wrong email in the classification, please let us know again. Classification accuracy will improve from the next time.

## Additional Information

* Automatically judge new mail and add classification tag (Thunderbird 78 or later + Autobucket 1.1.0 or later)
* If you want to sort the mails into folders according to the classified contents, please set the sorting with the message filter function of Thunderbird.
* AutoBucket does not execute the mail filter function. This is because I could not find a way to execute the mail filter function from the Web Extension specifications. If you want to execute the mail filter function automatically, please use the regular execution function of the mail filter function.

## Shortcut

* You can change the shortcut key from the gear icon on the upper right of the extension management screen.

![](https://github.com/a-tak/auto-bucket/raw/master/docs/shortcut-setting1.jpg)
![](https://github.com/a-tak/auto-bucket/raw/master/docs/shortcut-setting2.jpg)

* The default settings of shortcuts for each OS are as follows.

### Default Shortcut (Windows default)

| Function | Key |
|-----|------|
|Batch email judgment|Ctrl + B|
|Email judgment|Ctrl + Shift + C|
|Judgment log display|Ctrl + Shift + V|
|Statistical information|Ctrl + Shift + S|


### Default Shortcut (Mac default)

| Function | Key |
|-----|------|
|Batch email judgment|Option + Shift + B|
|Email judgment|Option + Shift + C|
|Judgment log display|Option + Shift + V|
|Statistical information|Option + Shift + S|

### Default Shortcut (Linux default)

| Function | Key |
|-----|------|
|Batch email judgment|Alt + Shift + B|
|Email judgment|Alt + Shift + C|
|Judgment log display|Ctrl + Shift + V|
|Statistical information|Alt + Shift + S|
