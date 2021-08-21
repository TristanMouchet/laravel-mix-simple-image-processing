const mix = require('laravel-mix')
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')
const sharp = require('sharp')
const imageSize = require('image-size')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')
const imageminWebp = require('imagemin-webp')

class SimpleImageProcessor {
    register(options = {}) {
        let {
            disable,
            source,
            destination,
            thumbnailsSizes,
            thumbnailsSuffix,
            thumbnailsOnly,
            processOnlySmallerThumbnails,
            webp,
            imageminPngquantOptions,
            imageminWebpOptions,
        } = Object.assign({
            disable: false,
            source: 'resources/images',
            destination: 'public/images',
            thumbnailsSizes: [],
            thumbnailsSuffix: '@',
            thumbnailsOnly: false,
            processOnlySmallerThumbnails: false,
            webp: false,
            imageminPngquantOptions: {
                quality: [0.3, 0.5]
            },
            imageminWebpOptions: {
                quality: 50
            },
        }, options)

        if (disable) {
            return
        }

        thumbnailsSizes.sort((a, b) => (a > b) ? 1 : -1)

        if (!thumbnailsOnly) {
            fs.copySync(source, destination)
        }

        let warnings = false;

        glob.sync(source + '/**/*').forEach((fromImagePath) => {
            if (fromImagePath.match(/\.(jpe?g|png|gif)$/i) === null) {
                return
            }

            let {root, dir, base, ext, name} = path.parse(fromImagePath)
            let width = imageSize(fromImagePath).width
            let destinationFolder = destination + dir.replace(source, '') + '/'

            if (!fs.existsSync(destinationFolder)) {
                fs.mkdirSync(destinationFolder);
            }

            thumbnailsSizes.forEach((w) => {
                if (width < w) {
                    if (processOnlySmallerThumbnails) {
                        return
                    } else {
                        warnings = true;
                        console.warn('mix.imgs() '+"\x1b[33m"+'WARN'+"\x1b[0m"+' Image "'+fromImagePath+'" (width: '+width+'px) is generating a thumbnail "'+destinationFolder+name+thumbnailsSuffix+w+ext+'" with a stretched resolution.')
                    } 
                }

                sharp(fromImagePath)
                    .resize(w)
                    .toFile(destinationFolder + name + thumbnailsSuffix + w + ext)
            })

            let files = [
                destinationFolder + name + thumbnailsSuffix + '*' + ext // All thumbnails / resized images
            ];

            if (!thumbnailsOnly) {
                files.push(destinationFolder + name + ext) // Full sized images
            }

            imagemin(files, {
                destination: destinationFolder,
                plugins: [
                    imageminJpegtran(),
                    imageminPngquant(imageminPngquantOptions),
                ],
            })

            if (webp) {
                imagemin(files, {
                    destination: destinationFolder,
                    plugins: [
                        imageminWebp(imageminWebpOptions)
                    ],
                })
            }
        })

        if (warnings) {
            console.log('')
        }
    }
}

mix.extend('imgs', new SimpleImageProcessor())
