export type IconType =
  | 'archive'
  | 'document'
  | 'image'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'text'
  | 'unknown';

export default function toIcon(extension: string): IconType {
  switch (extension.toLowerCase()) {
    case 'zip':
    case '7z':
    case 'bz2':
    case 'cab':
    case 'gz':
    case 'tar':
    case 'rar':
      return 'archive';
    case 'doc':
    case 'docx':
    case 'docm':
    case 'dot':
    case 'dotx':
    case 'dotm':
    case 'log':
    case 'msg':
    case 'odt':
    case 'pages':
    case 'rtf':
    case 'tex':
    case 'wpd':
    case 'wps':
      return 'document';
    case 'bmp':
    case 'png':
    case 'tiff':
    case 'tif':
    case 'gif':
    case 'jpg':
    case 'jpeg':
    case 'jpe':
    case 'psd':
    case 'ai':
    case 'ico':
      return 'image';
    case 'xlsx':
    case 'xlsm':
    case 'xltx':
    case 'xltm':
    case 'xlam':
    case 'xlr':
    case 'xls':
    case 'csv':
      return 'spreadsheet';
    case 'ppt':
    case 'pptx':
    case 'pot':
    case 'potx':
    case 'pptm':
    case 'potm':
    case 'xps':
      return 'presentation';
    case 'pdf':
      return 'pdf';
    case 'txt':
    case 'cnf':
    case 'conf':
    case 'map':
    case 'yaml':
      return 'text';
    default:
      return 'unknown';
  }
}
