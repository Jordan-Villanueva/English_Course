export const GITHUB = 'https://github.com/zyronon/TypeWords'
export const ProjectName = 'Type Words'

const common = {
  word_dict_list_version: 1
}
const map = {
  dev: {
    api: 'http://localhost/index.php',
  }
}
export const env = Object.assign(map['dev'], common)
