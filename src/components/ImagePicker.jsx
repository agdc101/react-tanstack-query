export default function ImagePicker({ images, selectedImage, onSelect }) {

  return (
    <div id="image-picker">
      <p>Select an image</p>
      <ul>
        {images.map((image, index) => (
          <li
            key={index}
            onClick={() => onSelect(image.path)}
            className={selectedImage === image.path ? 'selected' : undefined}
          >
            <img
              src={`http://localhost:3000/${image.path}`}
              alt={image.caption}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
