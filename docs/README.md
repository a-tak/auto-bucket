
# AutoBacket

![](icon-flat-large.svg)

## What is AutoBacket

A Thunderbird extension that automatically sorts emails into several buckets (tags) using a Bayesian filter.

## Basic usage

1. Add a classification tag to Thunderbird and restart Thunderbird
2. Select the tag used for classification from the add-on settings and restart Thunderbird
3. Right-click the email to learn which tag to assign
4. After classifying some, right click or shortcut to judge mail. AutoBacket automatically classifies and tags according to the learning content.
5. If you find a wrong email in the classification, please let us know again. Classification accuracy will improve from the next time.

## Application

* When you receive an email, it is convenient to use a shortcut to perform batch email determination. Currently, new mail cannot be automatically classified and tagged. This is because Thunderbird's Web Extension does not have that function.
* If you want to sort the mails into folders according to the classified contents, please set the sorting with the message filter function of Thunderbird.
* AutoBacket does not execute the mail filter function. This is because I could not find a way to execute the mail filter function from the Web Extension specifications. If you want to execute the mail filter function automatically, please use the regular execution function of the mail filter function.

## Shortcut (Windows)

| Function | Key |
|-----|------|
|Batch email judgment|Ctrl + B|
|Email judgment|Ctrl + Shift + C|
|Judgment log display|Ctrl + Shift + V|


## Shortcut (Mac)

| Function | Key |
|-----|------|
|Batch email judgment|Option + Shift + B|
|Email judgment|Option + Shift + C|
|Judgment log display|Option + Shift + V|
