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

        glob.sync(source + '/**/*').forEach((fromImagePath) => {
            if (fromImagePath.match(/\.(jpe?g|png|gif)$/i) === null) {
                return
            }

            let {root, dir, base, ext, name} = path.parse(fromImagePath)
            let width = imageSize(fromImagePath).width
            let destinationFolder = destination + dir.replace(source, '') + '/';

            if (!fs.existsSync(destinationFolder)) {
                fs.mkdirSync(destinationFolder);
            }

            thumbnailsSizes.forEach((w) => {
                if (width < w) {
                    return
                }

                sharp(fromImagePath)
                    .resize(w)
                    .toFile(destinationFolder + name + thumbnailsSuffix + w + ext)
            })

            let files = [
                destinationFolder + name + ext, // Full sized image (if thumbnailsOnly is set to true)
                destinationFolder + name + thumbnailsSuffix + '*' + ext // All other thumbnails / resized images
            ];

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
    }
}

mix.extend('imgs', new SimpleImageProcessor())
