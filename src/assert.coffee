module.exports = (test, errorMessage) ->
  if not test
    throw new Error(errorMessage)
