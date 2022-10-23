
# Laravel Mix - Simple Image Processing

A simple laravel mix plugin to copy/minify/resize images in your projects.


## Installation & Usage

Installation of the npm package:

```
npm install --save-dev laravel-mix-simple-image-processing
```

Usage, in your `webpack.mix.js`:

```js
let mix = require('laravel-mix')

require('laravel-mix-simple-image-processing')

mix.imgs({
    source: 'resources/images',
    destination: 'public/images',
    // ... other optional parameters
})
```

Executing the module (the following exemple is for a "development" environnement):

```
npm run dev
```

Note: when running `npm run watch` the module is only executed once at the beginning.


## Options

Here is the list of available options when passing an object to the mix.imgs() method:

| Option | Type | Default value | Description |
| --- | --- | --- | --- |
| disable | Boolean | `false` | Wether or not to disable the execution of the plugin, can be used to disable the execution on specific environnements. |
| source | String | `'resources/images'` | Path to the folder containing the images that will be used as input of the processing functions (images in sub-folders are also included). |
| destination | String | `'public/images'` | Path to the folder where the images will be saved (with source-like sub-folders). |
| processOriginalImage | Boolean | `true` | Wether or not to copy the original (full-sized) pictures in the destination folder. The full-sized pictures will be optimized in the destination folder. This option is useful if you only want to generate WebP files without copying the original files (by setting it to `false`). |
| webp | Boolean | `false` | Wether or not to generate WebP images. An image with the WebP format will be generated for each picture processed in the destination folder (including for all thumbnails if `thumbnailsWebp` is not specified). |
| thumbnailsSizes | Array[Int] | `[]` | A list of maximum-width (in pixel) thumbnail to generate. E.g. `[300, 600]` would generate 2 thumbnails for each image processed, one with a 300px width and one with a 600px width. The height of the images are calculated proportionally. The plugin will emit a warning for each value superior at the width of the source image. |
| thumbnailsSuffix | String | `'@'` | Suffix to be used for thumbnail names, the thumbnail names are based on the template `{img-name}{suffix}{width}.{img-extension}`, for example `image.jpg` could generate a thumbnail named `image@300.jpg`. |
| thumbnailsWebp | Boolean | `false` | Wether or not to generate thumbnails with a WebP extension. If not specified, will take the value of the `webp` parameter. |
| thumbnailsWebpOnly | Boolean | `false` | Wether or not to keep thumbnails with their original extensions (when `thumbnailsWebp` is true). |
| smallerThumbnailsOnly | Boolean | `false` | Whether or not to resize images to sizes below their native width. |
| imageminPngquantOptions | Object | `{ quality: [0.3, 0.5] }` | Options to pass to the [imageminPngquant](https://github.com/imagemin/imagemin-pngquant#api) plugin. |
| imageminWebpOptions | Object | `{ quality: 50 }` | Options to pass to the [imageminWebp](https://github.com/imagemin/imagemin-webp#api) plugin. |


## Exemples

Basic exemple (copy/optimize images from source to destination folder):
```js
mix.imgs({
    source: 'resources/images/photos',
    destination: 'public/images/photos',
})
```

Process images in all environnements EXCEPT for 'production':
```js
mix.imgs({
    disable: process.env.NODE_ENV === 'production',
    // ...
})
```

Generate thumbnails without the full-sized source images:
```js
mix.imgs({
    source: 'resources/images/photos',
    destination: 'public/images/photos/thumbnails',
    processOriginalImage: false, // Do not copy the original (full-sized) images over.
    thumbnailsSizes: [300, 600], // Generate thumbnails with 300px and 600px width.
})
```

Only generate WebP files (without images with their original extensions):
```js
mix.imgs({
    source: 'resources/images/photos',
    destination: 'public/images/photos',
    processOriginalImage: false, // Do not copy the original (full-sized) images over.
    webp: true,
})
```

Only generate thumbnails with WebP formats:
```js
mix.imgs({
    source: 'resources/images/photos',
    destination: 'public/images/webp-thumbnails',
    processOriginalImage: false,
    thumbnailsSizes: [300, 600],
    thumbnailsWebp: true,
    thumbnailsWebpOnly: true,
})
```

## Other

This plugin was originally inspired by the [laravel-mix-image-resizer](https://github.com/ryotamoriyama/laravel-mix-image-resizer) (which didn't seem to be maintained).
