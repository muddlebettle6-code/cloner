import Foundation
import Vision
import CoreImage

let args = CommandLine.arguments
guard args.count >= 3 else { FileHandle.standardError.write("usage: subject-cutout <input> <output>\n".data(using:.utf8)!); exit(1) }
let inputURL = URL(fileURLWithPath: args[1])
let outputURL = URL(fileURLWithPath: args[2])

guard let inputImage = CIImage(contentsOf: inputURL) else { print("cannot load image"); exit(1) }
let request = VNGenerateForegroundInstanceMaskRequest()
let handler = VNImageRequestHandler(ciImage: inputImage, options: [:])
do { try handler.perform([request]) } catch { print("vision failed: \(error)"); exit(2) }
guard let result = request.results?.first else { print("no subject found"); exit(3) }
do {
  let masked = try result.generateMaskedImage(ofInstances: result.allInstances, from: handler, croppedToInstancesExtent: false)
  let ciMasked = CIImage(cvPixelBuffer: masked)
  let context = CIContext()
  guard let cs = CGColorSpace(name: CGColorSpace.sRGB) else { exit(4) }
  try context.writePNGRepresentation(of: ciMasked, to: outputURL, format: .RGBA8, colorSpace: cs)
  print("cutout saved")
} catch { print("mask/write failed: \(error)"); exit(5) }
