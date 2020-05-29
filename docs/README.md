# AutoBucket

![](https://github.com/a-tak/auto-bucket/raw/master/docs/github-open-graph.png)

## What is AutoBucket

A Thunderbird extension that automatically sorts emails into several buckets (tags) using a Bayesian filter.

## Basic usage

1. Add a classification tag to Thunderbird and restart Thunderbird
2. Select the tag used for classification from the add-on settings and restart Thunderbird
3. Let's learn which tag to assign from AutoBucket in the menu displayed by right-clicking the email
4. After classifying some, right click or shortcut to judge mail. AutoBucket automatically classifies and tags according to the learning content.
5. If you find a wrong email in the classification, please let us know again. Classification accuracy will improve from the next time.

## Application

* When you receive an email, it is convenient to use a shortcut to perform batch email determination. Currently, new mail cannot be automatically classified and tagged. This is because Thunderbird's Web Extension does not have that function.
* If you want to sort the mails into folders according to the classified contents, please set the sorting with the message filter function of Thunderbird.
* AutoBucket does not execute the mail filter function. This is because I could not find a way to execute the mail filter function from the Web Extension specifications. If you want to execute the mail filter function automatically, please use the regular execution function of the mail filter function.

## Shortcut (Windows)

| Function | Key |
|-----|------|
|Batch email judgment|Ctrl + B|
|Email judgment|Ctrl + Shift + C|
|Judgment log display|Ctrl + Shift + V|
|Statistical information|Ctrl + Shift + S|


## Shortcut (Mac)

| Function | Key |
|-----|------|
|Batch email judgment|Option + Shift + B|
|Email judgment|Option + Shift + C|
|Judgment log display|Option + Shift + V|
|Statistical information|Option + Shift + S|
