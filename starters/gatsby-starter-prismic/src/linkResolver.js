exports.linkResolver = (doc) => {
  switch (doc.type) {
    case 'page': {
      if (doc.uid === 'home') {
        return '/'
      } else {
        return `/${doc.uid}/`
      }
    }

    default:
      return '/'
  }
}
