# P1 - Scaffold

Here we provide a place for you to do your work in project 1. We strongly encourage you to do your work here.

## Setup

As always, have npm/node/yarn installed.

```sh
npm install
# then
npm run start

# or if yarn-ing
yarn
# then
yarn start
```
Just as in the previous assignments we will be using the gulp build pipeline. This means that you
will still need to be explicit about your imports, eg
```js
import {functionFromModule} from 'target-module';
```

In this scaffold we have not installed any d3 packages. You are free to choose which aspects of the
d3 library you wish to use for this project. Some helpful ones (read the ones we usually use) are
d3-selection, d3-scale, and d3-shape. If you feel the need to import a non d3 library, just ask! The
answer will probably be yes.


## Your work

There will most likely be two components to your work for this project

- Data preparation: This means transforming your raw data into a manner that fits in the browser
  (the browser gets crashy at around 20mb), and is easy to render with d3. In order to keep
  everybody honest, we'd really appreciate it if you could include any and all data processing
  scripts you write in the scripts folder of this project. Please do not commit your data if it
  larger than 8 megabytes. Just include a link in your write up. On the other hand, if you have
  a small dataset, you should include commit it into the repository directly.

- Data presentation: Your code for actually rendering the data to the browser. This code should live
  in src/index.js and src/utils.js files. Feel free to make additional files if it makes sense.


## Tips
- Start early
- Ask for help if you need it
- If you have any extra fonts needed for your graphic please include a link to where they can be
  downloaded if they are nonstandard.
- Just like in hw4, if you want to use additional resources place them in the app/static
  folder. (this can be especially helpful if you have a complex legend that you don't want to render
  in d3. A effective technique would be to create your legend it a more user friendly vector drawing
  application and then import it here. See hw4 for examples on how to do that.)

## How your work will be prepared for print

The exact method we will be using to extract the svg from the browser will be crowbar. As discussed
previously crowbar ( https://nytimes.github.io/svg-crowbar/ ) is bookmarklet which allows for the
direct download of svg. Your work will then be transformed into a pdf, which will be delivered to
the print shop. It can be helpful to try crowbarring your graphic before turning it in to get a
sense of how it will look when we do it. Similarly it can be helpful to do proof-of-concpet prints
on an inexpensive home printer. This will give you a sense on how the components will be laid out.

## Some basic considerations for knowing whether you're done:

- Does your graphic have a title?
- Does your graphic have all of your group member's names on it?
- Does your graphic have a legend and a description?
- Refresh your page a few times, does your graphic always look the way it's supposed to?
- Does your javascript code pass lint?
- Does your graphic look the way you want when you crowbar it?

